# Obligatorio - Proyecto Inmo2.0

## Participantes
* Carmela Sotuyo - 186554
* Fernando Spillere - 271968
* Ignacio Malamud - 2744924

## Cómo ejecutar
0. Ejecutar por única vez el comando `docker network create inmo-network`
1. Estando en InmoServer ejecutar el archivo `windows_run.bat` o `mac_run.sh` que corresponda. Este es el servidor principal de la solución.
2. Estando en ReportsServer ejecutar el archivo `windows_run.bat` o `mac_run.sh` que corresponda. Este es el módulo de consultas y reportes.
3. Estando en SensorSimulator ejecutar el archivo `windows_run.bat` o `mac_run.sh` que corresponda. Este componente permite simular y enviar señales de sensores hacia el servidor principal mediante la implementación del patrón Publicador Suscriptor.
4. Estando en PaymentEmulator ejecutar el archivo `windows_run.bat` o `mac_run.sh` que corresponda. Este componente funciona como simulador de un servicio de pagos externo al cual el servidor principal se comunica mediante https para procesar pagos y obtener su resultado.
5. Estando en SampleSubscriber ejecutar el archivo `windows_run.bat` o `mac_run.sh` que corresponda. Este componente ejemplifica un componente externo de notificaciones, el cual se puede suscribir al envío de notificaciones del servidor principal y recibir los mensajes en base a tópicos.
6. Estando en LoadTestingComponent ejecutar `npm install` y luego `docker-compose up --build`. Este componente realiza load testing sobre el servidor principal, particularmente sobre el servicio de reservas, calculando la latencia promedio.
