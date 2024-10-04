const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');

/*let isAuthenticated = false;*/

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'mi_secreto_seguro',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge: 60000}
}));

//Conexion con la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'modanow'
});

db.connect((err) =>{
    if(err) throw err;
    console.log('Conectando a la base de datos MySQL');
});

//El puerto escucha y ha iniciado operaciones.
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

//configuración
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));


//variable de sesión
const { error } = require('console');
const { get } = require('http');
const { hash } = require('crypto');


//Inicio de sesion admin
app.get('/',(req, res)=>{
    res.sendFile(path.join(__dirname, '/IniciarSesion.html'));
});


//Inicio de sesion de la base de datos
app.post('/Iniciarsesion', (req, res) => {
    const {Nombre_Usuario, Contraseña_Usuario} = req.body;

    if(!Nombre_Usuario || !Contraseña_Usuario){
        return res.status(400).json({
            error: 'No data received'
        });
    }

    const query = `SELECT * FROM usuario WHERE Nombre_Usuario = ?`;

    db.execute(query, [Nombre_Usuario], (err, result)=>{
        if(err) throw err;

        if(result.length > 0){
            console.log(result[0]);
            
            bcrypt.compare(Contraseña_Usuario, result[0].Contraseña_Usuario, (err, isMatch)=>{
                console.log(isMatch); 
                if(isMatch){
                    req.session.loggedin = true;
                    req.session.Nombre_Usuario = Nombre_Usuario;
                    res.redirect('Correcta');
                }else{
                    res.send('Contraseña incorrecta.');
                }

                if(Nombre_Usuario=="Admin" && Contraseña_Usuario == "1234" )
                {
                    res.send('Usuario aceptado');
                    res.redirect("/producto");
                }
            });
        }else{
            res.send('Usuario no encontrado.');
        }
    });
});

app.post('/CrearCuenta', (req, res)=>{

        const {Nombre_Usuario, Contraseña_Usuario, Confirmanr_Contraseña} =req.body;

        
        if(Contraseña_Usuario == Confirmanr_Contraseña){

            bcrypt.hash(Contraseña_Usuario, 10, (err, hash)=>{
                const query = 'INSERT INTO usuario (Nombre_Usuario, Contraseña_Usuario) VALUES (?, ?)';
                db.execute(query, [Nombre_Usuario, hash], (err, result) => {
                if (err) {
                console.error('Error al crear un nuevo usuario:', err);
                if(Contraseña_Usuario != Confirmanr_Contraseña){
                    res.send('<h1>Error: Las contraseñas no considen.</h1>');
                }else{
                    res.send('<h1>Error al crear un nuevo usuario.</h1>');
                }
                
                } else {
                    res.send(`<h1>¡Usuario Registrado!</h1>
                    <p>
                    Usuario: ${Nombre_Usuario}, 
                    Contraseña: ${Contraseña_Usuario}
                    </p>
                  <a href="/index">Ingresar</a><br>
                  <a href="/">Cerrar sesión</a>`);
                }
            });
        })
    }else{
        res.send('<h1>Error: Las contraseñas no considen.</h1>');
    }       
});

//Verificación del usuario y envio la pagina de productos 
app.get('/productos',(req, res)=>{
    if(isAuthenticated){
        res.sendFile(path.join(__dirname, 'ProductoRopa.html'));
    }else{
        res.send('<h1>No autorizado</h1><p>Por favor, inicie sesión primero.</p>');    
    }
});


//Insertar los campos de productos en la base de datos
app.post('/productos', (req, res) =>{
    if (isAuthenticated) {
        const {Nombre_Producto, Valor_Producto, Cantidad_Productos, Marca_Producto, Nit_Producto, Fecha_Devolucion} = req.body;
    
        // Insertar producto en la base de datos
        const query = 'INSERT INTO productos (Nombre_Producto, Valor_Producto, Cantidad_Productos, Marca_Producto, Nit_Producto, Fecha_Devolucion) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [Nombre_Producto, Valor_Producto, Cantidad_Productos, Marca_Producto, Nit_Producto, Fecha_Devolucion], (err, result) => {
          if (err) {
            console.error('Error al insertar producto:', err);
            res.send('<h1>Error al registrar el producto.</h1>');
          } else {
            res.send(`<h1>¡Producto registrado!</h1>
                <p>Producto: ${Nombre_Producto}, Precio: ${Valor_Producto},
                <br> Cantidad: ${Cantidad_Productos}, Marca: ${Marca_Producto},
                <br> NIT: ${Nit_Producto}, Fecha de devolucion: ${Fecha_Devolucion}</p>
                      <a href="/productos">Registrar otro producto</a><br>
                      <a href="/">Cerrar sesión</a>`);
          }
        });
      } else {
        res.send('<h1>No autorizado</h1><p>Por favor, inicie sesión primero.</p>');
      }
});

//Cierre de sesión
app.get('/logout', (req, res) => {
    isAuthenticated = false;
    res.redirect('/');
});
