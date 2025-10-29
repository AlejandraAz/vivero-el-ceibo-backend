import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";
import { OAuth2Client } from "google-auth-library";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helpers
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });


// LOGIN CON GOOGLE
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ status: 400, message: "No credential provided." });
    }

    // 1. Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture } = payload;

    // 2. Buscar usuario en la BD
    let user = await Customer.findOne({ where: { googleId } });

    // Si no existe por googleId, probar por email (quizás ya tenía cuenta normal)
    if (!user) {
      user = await Customer.findOne({ where: { email } });
    }

    // 3. Crear si no existe
    if (!user) {
      user = await Customer.create({
        googleId,
        email,
        name,
        photo: picture,
        password: null, // no tiene contraseña
        authMethod: "google",
      });
    } else if (!user.googleId) {
      // Caso: tenía cuenta normal y ahora se loguea con Google → vincular
      user.googleId = googleId;
      user.authMethod = 'google'; 
      if (!user.photo) user.photo = picture;
      await user.save();
    }

    console.log("Usuario después de registro:", user);
    // 4. Tokens
    const accessToken = signAccessToken({
      sub: user.id,
      rol: user.rol,
      type: "customer",
    });

    const refreshToken = signRefreshToken({
      sub: user.id,
      rol: user.rol,
      type: "customer",
    });

    // 5. Guardar en cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // 6. Respuesta
    return res.status(200).json({
      status: 200,
      message: "Google login successful.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        rol: user.rol,
        authMethod: user.authMethod,
        type: "customer",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ status: 401, message: "Google authentication failed." });
  }
};

// LOGIN UNIFICADO
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("Datos recibidos en login:", req.body);

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email and password are required."
      });
    }

    // 1. Buscar primero en clientes
    let user = await Customer.findOne({ where: { email } });
    let userType = "customer";
    
    // 2. Si no existe, buscar en admins
    if (!user) {
        user = await Admin.findOne({ where: { email } });
        userType = "admin";
    }
    // 💡 Primero verificar si existe el usuario
if (!user) {
  return res.status(401).json({ status: 401, message: "Invalid credentials." });
}
    if (user.accountStatus !== "activo") {
            return res.status(403).json({ status: 403, message: "Account is blocked." });
        }
    


    if (!user.password) {
  return res.status(401).json({ 
    status: 401, 
    message: "Este usuario se registró con Google, no tiene contraseña." 
  });
}

    // 3. Verificar contraseña
    const ok = await user.checkPassword(password);
    if (!ok) {
      return res.status(401).json({ status: 401, message: "Invalid credentials." });
    }

    // 4. Tokens
    const accessToken = signAccessToken({ sub: user.id, rol: user.rol, type: userType });
    const refreshToken = signRefreshToken({ sub: user.id, rol: user.rol, type: userType });

    // 5. Guardar cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    // 6. Respuesta
    return res.status(200).json({
      status: 200,
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        type: userType
      }
    });

  } catch (err) {
    next(err);
  }
};

// REFRESH UNIFICADO
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ status: 401, message: "No refresh token." });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    let user =
      decoded.type === "admin"
        ? await Admin.findByPk(decoded.sub)
        : await Customer.findByPk(decoded.sub);

    if (!user) {
      return res.status(403).json({ status: 403, message: "User not found." });
    }

    const newAccessToken = signAccessToken({
      sub: user.id,
      rol: user.rol,
      type: decoded.type
    });

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60
    });

    return res.json({ status: 200, message: "Access token refreshed." });
  } catch (err) {
    return res.status(401).json({ status: 401, message: "Invalid or expired refresh token." });
  }
};

// LOGOUT UNIFICADO
export const logout = async (req, res) => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.status(200).json({ status: 200, message: "Logged out." });
  } catch (err) {
    return res.status(500).json({ status: 500, message: "Error during logout." });
  }
};
