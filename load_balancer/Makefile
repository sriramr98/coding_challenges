run_dummy:
	docker-compose -f dummy_server/compose.yaml up -d

run_lb:
	go run *.go test.yml

run: run_dummy run_lb
