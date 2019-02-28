docker-compose -f docker-compose.builder.yml run --rm install-appl
docker-compose -f docker-compose.builder.yml run --rm install-test

docker-compose rm -f
docker-compose build
docker-compose up --timeout 1 --no-build -d

docker-compose run test npm test
exitCode=$?


docker-compose stop
exit "$exitCode"
