1. Tener docker isntalado :

2: Clonar el repositorio : 
$ git clone https://github.com/DefectDojo/django-DefectDojo

3. Construir y levantar :

$ cd django-DefectDojo
$ docker compose build
$ docker compose up -d

4. Obtener contraseña de administrador :

$ docker compose logs initializer | Select-String "Admin password:"
   

5. Entrar a Defect Dojo :
abrir el navegador en http://localhost:8080
usuario : admin
password : el resultado que mostro en el paso 4.

