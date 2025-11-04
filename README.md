📌 Descripción

Este backend forma parte del e-commerce Vivero El Ceibo, un proyecto destinado a digitalizar la venta de productos de jardinería.
Permite gestionar usuarios, productos, carritos, pedidos, reseñas, categorías y envíos, incluyendo panel administrativo con permisos.

🛠️ Tecnologías

Node.js + Express

Sequelize ORM + MySQL

JWT + Cookies HTTP-Only (autenticación)

Multer (subida de imágenes)

Cloudinary (almacenamiento de imágenes)

Morgan + CORS

git clone https://github.com/AlejandraAz/vivero-el-ceibo-backend.git
cd vivero-el-ceibo-backend
npm install


DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=vivero_el_ceibo
DB_PORT=3306
DB_DIALECT=mysql

JWT_SECRET=clave
JWT_REFRESH_SECRET=clave_refresh

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GROQ_API_KEY= 

EMAIL_USER=
EMAIL_PASS=

NODE_ENV=development


Iniciar servidor:
npm run dev

En caso de sincronizacion:
npm run db:sync

🔥 Autenticación

✅ Login con JWT + Cookies seguras

✅ Middleware protect (verifica token)

✅ Middleware restrictTo (rol: admin o cliente)

🧭 Endpoints Principales

Todas las rutas comienzan con /api

🔐 Autenticación (/auth)
| Método | Endpoint         | Rol           | Descripción       |
| ------ | ---------------- | ------------- | ----------------- |
| POST   | `/auth/login`    | Público       | Iniciar sesión    |
| POST   | `/auth/register` | Público       | Registrar cliente |
| POST   | `/auth/logout`   | Cliente/Admin | Cerrar sesión     |
| POST   | `/auth/refresh`  | Público       | Renovar token     |
| POST   | `/auth/google`   | Público       | Login con Google  |

🧑‍💼 Admin Panel (/admin)
| Método | Endpoint                        | Rol   | Descripción                   |
| ------ | ------------------------------- | ----- | ----------------------------- |
| GET    | `/admin/customers`              | Admin | Listar clientes               |
| PATCH  | `/admin/customers/:id/status`   | Admin | Cambiar estado cuenta cliente |
| GET    | `/admin/orders`                 | Admin | Listar pedidos                |
| GET    | `/admin/orders/:id`             | Admin | Ver pedido específico         |
| PUT    | `/admin/orders/:id/status`      | Admin | Cambiar estado pedido         |
| GET    | `/admin/reviews`                | Admin | Listar reseñas                |
| GET    | `/admin/reviews/pending`        | Admin | Reseñas pendientes            |
| PATCH  | `/admin/reviews/:id/status`     | Admin | Aprobar/rechazar reseña       |
| GET    | `/admin/cart`                   | Admin | Listar carritos               |
| GET    | `/admin/customers/user-by-week` | Admin | Métrica para gráficos         |

🧑‍🌾 Clientes (/customer/profile)

| Método | Endpoint                            | Rol     | Descripción        |
| ------ | ----------------------------------- | ------- | ------------------ |
| GET    | `/customer/profile`                 | Cliente | Mi perfil          |
| PUT    | `/customer/profile`                 | Cliente | Actualizar perfil  |
| PUT    | `/customer/profile/change-password` | Cliente | Cambiar contraseña |
| GET    | `/customer/profile/my-orders`       | Cliente | Mis pedidos        |

🛍️ Productos (/products y /admin/products)

| Método | Endpoint             | Rol     | Descripción       |
| ------ | -------------------- | ------- | ----------------- |
| GET    | `/products`          | Público | Listar productos  |
| GET    | `/products/:id`      | Público | Ver producto      |
| GET    | `/products/featured` | Público | Destacados        |
| GET    | `/products/search`   | Público | Buscar productos  |
| GET    | `/products/catalog`  | Público | Catálogo filtrado |

Admin:

| POST | /admin/products | Admin | Crear producto (con imágenes) |
| PUT | /admin/products/:id | Admin | Editar producto |
| DELETE | /admin/products/:id | Admin | Eliminar (lógica) |
| PATCH | /admin/products/:id/featured | Admin | Destacar producto |
| PUT | /admin/products/:id/restore | Admin | Restaurar producto |



🏷️ Categorías (/categories y /admin/categories)

| GET | /categories | Público | Categorías activas |
| GET | /admin/categories | Admin | Listar |
| POST | /admin/categories | Admin | Crear |
| PUT | /admin/categories/:id | Admin | Editar |
| PATCH | /admin/categories/:id/toggle | Admin | Activar/desactivar |

🛒 Carrito (/cart, /cart-item)

| POST | /cart | Cliente | Crear carrito |
| GET | /cart/my-items | Cliente | Ver mis items |
| POST | /cart-item | Cliente | Añadir item |
| PUT | /cart-item/:id | Cliente | Editar cantidad |
| DELETE | /cart-item/:id | Cliente | Quitar item |
| DELETE | /cart-item/clear/:id_cart | Cliente | Vaciar carrito |

📦 Pedidos (/orders)

| POST | /orders | Cliente | Crear pedido |
| GET | /orders | Cliente | Listar mis pedidos |
| GET | /orders/:id | Cliente | Ver pedido |

🚚 Envíos (/shipping)

| POST | /shipping | Cliente | Crear método de envío |
| GET | /shipping/:id | Cliente | Ver envío |

(Admin tiene endpoints adicionales en /admin/shipping)

⭐ Reseñas (/reviews)

| POST | /reviews | Cliente | Crear reseña |
| GET | /reviews/my-reviews | Cliente | Mis reseñas |
| GET | /reviews/product/:id | Público | Reseñas aprobadas |
| DELETE | /reviews/:id | Cliente/Admin | Eliminar |

🤖 Chatbot (/chatbot)

| POST | /chatbot/query | Público | Consulta al chatbot |

📌 Diagrama Entidad-Relación

🔗 https://drive.google.com/file/d/1fmcuDrxJFrmjp9y4OogVuUjY0Ho9bXbu/view?usp=sharing

📍 Nombres en BD en español — nombres en backend en inglés para buenas prácticas

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

## Seeds (datos iniciales)

✅ Se incluye un seed que crea un **administrador inicial**.
para activarlo,descomentarlo en el index.js que se encuentra en la raiz del proyecto. 

---

## Notas importantes

- 🛒 Los **carritos se inactivan automáticamente** una vez que se confirma un pedido, para evitar duplicaciones o cambios posteriores.
- 🌐 Las rutas están organizadas con prefijos `/api` para facilitar futuras integraciones frontend.



✅ Estado del Proyecto

✔ Panel Admin
✔ Productos, categorías, reseñas, carritos y pedidos
⚠ En mejora continua: checkout + automatización de envíos