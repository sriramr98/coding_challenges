run_dummy:
	docker-compose -f dummy_server/compose.yaml up -d

run_lb:
	go run *.go test.yml

dummy_stop:
	docker-compose -f dummy_server/compose.yaml down

run: run_dummy run_lb

run_build: run_dummy_build run_lb

stop: dummy_stop lb_stop
