docker compose up
start application
http://localhost:8080/consumers/start?id=1&topic=test-topic&groupId=test-group
http://localhost:8080/consumers/test-send?topic=test-topic&message=hello-world
http://localhost:8080/consumers/stop?id=1