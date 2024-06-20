FROM loadimpact/k6

COPY src/loadTest.js /loadTest.js

# ENTRYPOINT ["k6", "run", "/loadTest.js"]

ENTRYPOINT ["k6", "run", "--out", "json=result.json", "/loadTest.js"]

