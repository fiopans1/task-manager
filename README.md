# task-manager
This is my personal task manager application



## Lanzar base de datos:
docker run --name database -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=developer -d mysql