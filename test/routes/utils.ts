import supertest from 'supertest';
import { Express } from 'express';
import { EncryptedToken } from '../../src/core/entities/Token';

export const user = {
  username: "username",
  password: "password"
}

export async function registerUser(server: Express, user: any): Promise<EncryptedToken>{
  return new Promise(resolve => {
    supertest(server)
      .post("/user/register")
      .send(user)
      .expect(201)
      .then(res => resolve(new EncryptedToken(res.body.token)));
  })
}
