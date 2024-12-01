import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Connection, RowDataPacket } from 'mysql2/promise';

// Creates anadmin in db with authorization data from .env
const createAdmin = async (connection: Connection): Promise<void> => {
  dotenv.config();
  try {
    if (!process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        'ADMIN_LOGIN та ADMIN_PASSWORD must be included in .env file'
      );
    }

    const checkQuery = `SELECT COUNT(*) AS count FROM admins WHERE login = ?`;
    const [rows] = await connection.execute<RowDataPacket[]>(checkQuery, [
      process.env.ADMIN_LOGIN,
    ]);

    const adminExists = rows[0]?.count > 0;

    // Creates once admin's data and inserts it to db
    if (adminExists) {
      console.log(
        'There is an admin with such login already. Nothing has happaned'
      );
      return;
    }

    const insertQuery = `
      INSERT INTO admins (login, password)
      VALUES (?, ?);
    `;

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await connection.execute(insertQuery, [
      process.env.ADMIN_LOGIN,
      hashedPassword,
    ]);

    console.log('Admin created!');
  } catch (error) {
    console.error('Error while creating admin: ', error);
  }
};

export default createAdmin;
