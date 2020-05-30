const request = require('supertest');
const { model, connection, Types } = require('mongoose');
const { expect } = require('chai');

const { createUser } = require('@helpers/utils');
const { it, before, describe, afterEach } = require('mocha');

const { prefix } = require('@config/index').app;

const User = model('User');
const Role = model('Role');

const express = require('@config/lib/express');

/**
 * Globals
 */
let app;
const credentials = {
  username: 'username',
  password: 'jsI$Aw3$0m3',
};
let agent;

/**
 * Sections tests
 */
describe('Role tests', () => {
  before(async () => {
    // Get application
    app = await express.init(connection.db);
    agent = request.agent(app);
  });
  describe('Create new role', () => {
    it('I am not allowed to create a role if I am not authenticated (error 401)', async () => {
      await agent.post(`${prefix}/roles`).send({}).expect(401);
    });
    it('I am not allowed to create role if I don\'t have the IAM "vendor:users:roles:create"', async () => {
      await createUser(credentials, ['users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const data = {
        name: 'new rol',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      };
      await agent.post(`${prefix}/roles`).send(data).expect(403);
    });
    it('I am allowed to create a role if I have the IAM "vendor:users:roles:create"', async () => {
      await createUser(credentials, ['vendor:users:roles:create', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const data = {
        name: 'new rol',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      };
      const s = await agent.post(`${prefix}/roles`).send(data).expect(200);
      const { title, name, iams } = s.body;
      title.should.equal(data.title);
      name.should.equal(data.name);
      expect(iams).to.be.an('array');
    });
    it('I am not allowed to create a role  without required attributs (name and iams)', async () => {
      await createUser(credentials, ['vendor:users:roles:create', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const data = {
        name: 'new Rol',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
      };
      await agent.post(`${prefix}/roles`).send(data).expect(400);
    });
    it('I am allowed to create a role if already exist"', async () => {
      const u = await createUser(credentials, ['vendor:users:roles:create', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const data = {
        name: u.name, // existign role
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      };
      await agent.post(`${prefix}/roles`).send(data).expect(400);
    });
  });
  describe('Edit  role', () => {
    it('I am not allowed to edit a role if I am not authenticated (error 401)', async () => {
      await agent.post(`${prefix}/roles`).send({}).expect(401);
    });
    it('I am not allowed to edit a role if I dont have the IAM "vendor:users:roles:update"', async () => {
      await createUser(credentials, ['users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const { _id: id } = await new Role({
        name: 'new roles',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      }).save();

      const data = {
        name: 'new rol',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      };
      await agent.put(`${prefix}/roles/${id}`).send(data).expect(403);
    });
    it('I am allowed to edit a role if I have the IAM "vendor:users:roles:create"', async () => {
      await createUser(credentials, ['vendor:users:roles:update', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const r = new Role({
        name: 'new role',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      });
      const { _id: id } = r;
      await r.save();
      const data = {
        name: 'new rol update',
        title: 'Mon rôle personnalisé update',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      };
      await agent.put(`${prefix}/roles/${id}`).send(data).expect(200);
    });
    it('I am allowed to edit a role if role ID not exist ', async () => {
      await createUser(credentials, ['vendor:users:roles:update', 'users:auth:signin']);

      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const any_id = Types.ObjectId();
      const data = {
        name: 'new rol update',
        title: 'Mon rôle personnalisé update',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      };
      await agent.put(`${prefix}/roles/${any_id}`).send(data).expect(404);
    });
    it('I am allowed to edit a role if role ID invalid ', async () => {
      await createUser(credentials, ['vendor:users:roles:update', 'users:auth:signin']);

      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const data = {
        name: 'new rol update',
        title: 'Mon rôle personnalisé update',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      };
      await agent.put(`${prefix}/roles/00000000`).send(data).expect(400);
    });
  });
  describe(' List role and iams', () => {
    it('I am not allowed to list roles if I am not authenticated (error 401)', async () => {
      await agent.get(`${prefix}/roles`).send({}).expect(401);
    });
    it('I am not allowed to list  roles if I dont have the IAM "vendor:users:roles:list"', async () => {
      await createUser(credentials, ['users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      await agent.get(`${prefix}/roles`).send().expect(403);
    });
    it('I am allowed to list  roles if I have the IAM "vendor:users:roles:list"', async () => {
      await createUser(credentials, ['vendor:users:roles:list', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);

      await agent.get(`${prefix}/roles`).send().expect(200);
    });
    it('I am allowed to send the list of IAMs (the list of IDs) if role ID exist', async () => {
      await createUser(credentials, ['vendor:users:roles:get', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const { _id: id } = await new Role({
        name: 'new roles',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      }).save();

      const res = await agent.get(`${prefix}/roles/${id}`).send().expect(200);
      const { iams } = res.body;
      expect(iams).to.be.an('array');
    });
    it('I am not allowed to send the list of IAMs (the list of IDs) if role ID not exist', async () => {
      await createUser(credentials, ['vendor:users:roles:get', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const any_id = Types.ObjectId();
      await agent.get(`${prefix}/roles/${any_id}`).send().expect(404);
    });
    it('I am not allowed to send the list of IAMs (the list of IDs) if role ID invalid', async () => {
      await createUser(credentials, ['vendor:users:roles:get', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      await agent.get(`${prefix}/roles/0009990909`).send().expect(400);
    });
    it('I am allowed to send the details of each IAM if you send the parameter $expand=iams', async () => {
      await createUser(credentials, ['vendor:users:roles:get', 'users:auth:signin']);
      await agent.post('/api/v1/auth/signin').send(credentials).expect(200);
      const { _id: id } = await new Role({
        name: 'new roles',
        title: 'Mon rôle personnalisé',
        description: 'Ce rôle est utilisé pour gérer les contrats',
        iams: [],
      }).save();

      const res = await agent.get(`${prefix}/roles/${id}?$expand=iams`).send().expect(200);
      const { iams } = res.body;
      expect(iams).to.be.an('array');
    });
  });

  afterEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({
        name: {
          $nin: ['guest', 'user', 'admin'],
        },
      }),
    ]);
  });
});
