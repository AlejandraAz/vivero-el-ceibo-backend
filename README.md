# Backend - Vivero El Ceibo 

## Descripción

Este backend es parte del proyecto **"Vivero El Ceibo"**, un e-commerce orientado a la venta de productos de vivero. Permite gestionar usuarios, administradores, productos, carritos de compra, pedidos y envíos.

---

## Tecnologías utilizadas

- Node.js
- Express
- Sequelize ORM
- MySQL 
- CORS y Morgan (para desarrollo)

---

## Instalación y ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/AlejandraAz/vivero-el-ceibo-backend.git
cd vivero-el-ceibo-backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (`.env`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=vivero_el_ceibo
DB_PORT=3306
DB_DIALECT = mysql
```


4. Iniciar el servidor:

```bash
npm start
```

---

## Estructura de rutas y endpoints principales

| Método | Endpoint                         | Descripción                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/api/customers`                 | Obtener todos los clientes           |
| POST   | `/api/customers`                 | Crear nuevo cliente                  |
| PUT    | `/api/customers/:id`             | Actualizar datos de cliente          |
| PUT    | `/api/customers/:id/status`      | Cambiar estado de cuenta del cliente |
| GET    | `/api/categories`                | Listar categorías de productos       |
| POST   | `/api/categories`                | Crear nueva categoría                |
| GET    | `/api/products`                  | Listar productos                     |
| POST   | `/api/products`                  | Crear nuevo producto                 |
| PUT    | `/api/products/:id`              | Actualizar producto                  |
| DELETE | `/api/products/:id`              | Eliminar producto                    |
| GET    | `/api/carts`                     | Obtener todos los carritos           |
| POST   | `/api/carts`                     | Crear un carrito                     |
| PUT    | `/api/carts/:id/status`          | Cambiar estado de un carrito         |
| GET    | `/api/cart-items/cart/:id`       | Obtener ítems de un carrito por ID   |
| POST   | `/api/cart-items`                | Agregar producto a carrito           |
| DELETE | `/api/cart-items/:id`            | Eliminar ítem del carrito            |
| GET    | `/api/orders`                    | Listar todos los pedidos             |
| POST   | `/api/orders`                    | Crear nuevo pedido (desde un carrito)|
| GET    | `/api/orders/:id`                | Ver detalles de un pedido            |
| POST   | `/api/order-details`             | Crear manualmente detalle de pedido  |
| GET    | `/api/shippings`                 | Obtener métodos de envío             |

---

## Espacio para el DER

🔗 https://drive.google.com/file/d/1ag_1WwZrCadLKiay6jn80xD8ob2fzZkf/view?usp=sharing


📌 **Nota:** Las **relaciones y nombres del DER están en español**, mientras que el **backend está en inglés**, por buenas prácticas y para facilitar el trabajo en equipo si se suman personas extranjeras o se necesita escalar el sistema.

---
## Modelos del sistema

- Customer:representa a los clientes registrados en el sistema. Pueden explorar productos, agregar artículos al carrito, realizar pedidos y recibir envíos.
- Admin:usuario administrador del sistema. Tiene permisos para gestionar productos, categorías y pedidos. Además, puede activar, bloquear o desbloquear cuentas de clientes en caso de incumplimiento de las políticas de la empresa.
- Product: catálogo de productos disponibles en el vivero. Cada producto pertenece a una categoría.  
- Cart: representa el carrito de compras de un cliente. Puede estar activo o inactivo y almacenar múltiples productos seleccionados por el usuario antes de concretar una compra.
- CartItem:relación entre un carrito y los productos que contiene. Incluye información como la cantidad seleccionada y el precio unitario al momento de agregarlo al carrito.
- Order: pedido realizado por un cliente. Contiene la información general del pedido como fecha, total, estado, cliente que lo realizó y, opcionalmente, un envío asociado.
- OrderDetail:detalle de los productos incluidos en un pedido. Por cada producto comprado, se guarda la cantidad, el precio y la relación con el producto y el pedido.
- Category: clasificación de los productos. Facilita la organización del catálogo y la navegación por parte de los usuarios.
- Shipping: información del envío asociado a un pedido. Contiene detalles como la dirección.

---

## Uso con Postman

Se incluye una colección de Postman para facilitar las pruebas de la API.
- Permite testear cada endpoint del sistema (registro, login, productos, pedidos, etc.).
- Para usarla:
  1. Descargar el archivo `.json` desde el siguiente enlace.
  2. Importarlo en Postman.
  3. Modificar si es necesario la `baseURL` y el `PORT` según tu entorno local.
  ---[ViveroElCeibo.postman_collection.json](https://github.com/user-attachments/files/20952066/ViveroElCeibo.postman_collection.json)

---

## Seeds (datos iniciales)

✅ Se incluye un seed que crea un **administrador inicial**.
para activarlo,descomentarlo en el index.js que se encuentra en la raiz del proyecto. 

---

## Notas importantes

- 🔐 El backend **actualmente no incluye autenticación ni autorización**.
- 🛒 Los **carritos se inactivan automáticamente** una vez que se confirma un pedido, para evitar duplicaciones o cambios posteriores.
- 🌐 Las rutas están organizadas con prefijos `/api` para facilitar futuras integraciones frontend.





