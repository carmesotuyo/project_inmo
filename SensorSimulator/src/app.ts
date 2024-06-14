const { connect } = require('amqplib');
const dotenv = require('dotenv');
const faker = require('faker');
dotenv.config();

const REQUESTS_PER_SECOND = Number(process.env.REQUESTS_PER_SECOND) || 100;
const SENSOR_IDS = process.env.SENSOR_IDS ? process.env.SENSOR_IDS.split(',') : [];
const SIGNAL_TYPES = process.env.SIGNAL_TYPES ? process.env.SIGNAL_TYPES.split(',') : [];

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateSignalData = () => {
  let sensorId;
  if (Math.random() < 0.8 && SENSOR_IDS.length > 0) {
    sensorId = SENSOR_IDS[randomInt(0, SENSOR_IDS.length - 1)];
  } else {
    sensorId = faker.random.alphaNumeric(8); // ids de sensores inexistentes
  }

  const dateTime = new Date().toISOString();
  const signalType = SIGNAL_TYPES[randomInt(0, SIGNAL_TYPES.length - 1)];
  let signalData;

  switch (signalType) {
    case 'humidity':
      const isOutsideNormalRange = Math.random() > 0.8; // 20% posibilidad de mandar fuera de rango, para verificar alertas
      const humidityValue = isOutsideNormalRange ? randomInt(-50, 350) : randomInt(0, 100);
      signalData = {
        sensorId,
        dateTime,
        [signalType]: humidityValue,
      };
      break;
    default:
      signalData = {
        sensorId,
        dateTime,
        [signalType]: faker.lorem.sentence(),
      };
      break;
  }

  return JSON.stringify(signalData);
};

// Function to connect to RabbitMQ and publish messages
const simulateSensorSignals = async () => {
  try {
    const connection = await connect({
      hostname: process.env.RABBITMQ_HOST || 'localhost',
      port: Number(process.env.RABBITMQ_PORT) || 5672,
      username: process.env.RABBITMQ_USER || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
    });

    const channel = await connection.createChannel();

    const exchange = 'sensor_data_exchange';
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    console.log('Connected to RabbitMQ with exchange ' + exchange);

    setInterval(() => {
      const message = generateSignalData();
      channel.publish(exchange, '', Buffer.from(message));
      console.log(`Sent message: ${message}`);
    }, 1000 / REQUESTS_PER_SECOND);
  } catch (error) {
    console.error('Error in simulator:', error);
  }
};

simulateSensorSignals();
