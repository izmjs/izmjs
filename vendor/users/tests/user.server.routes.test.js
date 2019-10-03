/* eslint-env node, mocha */
/* eslint-disable import/no-dynamic-require */

const should = require('should');
const request = require('supertest');
const path = require('path');
const mongoose = require('mongoose');
const {
  it, before, describe, afterEach, beforeEach,
} = require('mocha');

const User = mongoose.model('User');
const express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
let app;
let agent;
let credentials;
let credentialsEmail;
let user;
let userTmp;

/**
 * User routes tests
 */
describe('User CRUD tests', () => {
  before(async () => {
    // Get application
    app = await express.init(mongoose.connection.db);
    agent = request.agent(app);
  });

  beforeEach(async () => {
    // Create user credentials with username
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3',
    };

    // Create user credentials with email
    credentialsEmail = {
      username: 'test@test.com',
      password: credentials.password,
    };

    // Create a new user
    userTmp = {
      name: {
        first: 'Full',
        last: 'Name',
      },
      email: credentialsEmail.username,
      username: credentials.username,
      password: credentials.password,
      provider: 'local',
      validations: [
        {
          type: 'email',
          validated: true,
          code: '4gdhavpssmm4533mqc2p7gjqsysumcgc8pyd7hrb6nex1yx93kexae8q9tq5chm6m61qau1zdeqcuea9',
        },
      ],
    };

    user = new User(userTmp);

    // Save a user to the test db
    await user.save();
  });

  it('should be able to register a new user', async () => {
    userTmp.username = 'register_new_user';
    userTmp.email = 'register_new_user_@test.com';

    const result = await agent
      .post('/api/v1/auth/signup')
      .send(userTmp)
      .expect(200);

    result.body.username.should.equal(userTmp.username);
    result.body.email.should.equal(userTmp.email);
    // Assert a proper profile image has been set, even if by default
    result.body.profilePictureUrl.should.not.be.empty();
    // Assert we have just the default 'user' role
    result.body.roles.should.be.instanceof(Array).and.have.lengthOf(1);
    result.body.roles.indexOf('user').should.equal(0);
  });

  it('should validate the email', async () => {
    user.validations = user.validations.toObject().map((v) => ({
      ...v,
      validated: false,
    }));

    await user.save();

    const resp = await agent
      .get('/api/v1/auth/confirm')
      .set('Accept', 'application/json')
      .query({
        type: 'email',
        uid: user.id,
        code: user.validations[0].code,
      })
      .send(userTmp)
      .expect(200);

    resp.body.ok.should.equal(true);
  });

  it('should not be able to authenticate with wrong credentials', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send({
        username: 'DUMMY_USERNAME',
        password: 'DUMMY_PASSWORD',
      })
      .expect(401);
  });

  it('should be able to login with username successfully and logout successfully', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);
    const signoutRes = await agent.get('/api/v1/auth/signout').expect(302);

    signoutRes.redirect.should.equal(true);
    signoutRes.text.should.equal('Found. Redirecting to /#/auth');
  });

  it('should be able to login with email successfully and logout successfully', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send(credentialsEmail)
      .expect(200);
    const signoutRes = await agent.get('/api/v1/auth/signout').expect(302);
    signoutRes.redirect.should.equal(true);
    signoutRes.text.should.equal('Found. Redirecting to /#/auth');
  });

  it('should be able to retrieve a list of users if admin', async () => {
    user.roles = ['user', 'admin'];

    await user.save();
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);
    const usersGetRes = await agent.get('/api/v1/users').expect(200);

    usersGetRes.body.value.should.be.instanceof(Array).and.have.lengthOf(1);
  });

  it('should be able to get a single user details if admin', async () => {
    const { _id: id } = user;
    user.roles = ['user', 'admin'];

    await user.save();
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);
    const { body } = await agent.get(`/api/v1/users/${id}`).expect(200);

    body.should.be.instanceof(Object);

    const { _id: bId } = body;
    bId.should.be.equal(String(id));
  });

  it('should be able to update a single user details if admin', async () => {
    user.roles = ['user', 'admin'];

    await user.save();
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);

    const userUpdate = {
      name: {
        first: 'admin_update_first',
        last: 'admin_update_last',
      },
      roles: ['admin'],
    };

    const { body } = await agent
      .put(`/api/v1/users/${user.id}`)
      .send(userUpdate)
      .expect(200);

    body.should.be.instanceof(Object);

    const { _id: bId } = body;
    const { _id: uId } = user;

    body.name.first.should.be.equal('admin_update_first');
    body.name.last.should.be.equal('admin_update_last');
    body.roles.should.be.instanceof(Array).and.have.lengthOf(1);
    bId.should.be.equal(String(uId));
  });

  it('should be able to delete a single user if admin', async () => {
    user.roles = ['user', 'admin'];

    await user.save();
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);
    await agent.delete(`/api/v1/users/${user.id}`).expect(204);
  });

  it('forgot password should return 400 for non-existent username', async () => {
    user.roles = ['user'];

    await user.save();

    const res = await agent
      .post('/api/v1/auth/forgot')
      .send({
        username: 'some_username_that_doesnt_exist',
      })
      .expect(400);

    res.body.message.should.equal(
      'Aucun compte avec l\'utilisateur "some_username_that_doesnt_exist" n\'est trouvé',
    );
  });

  it('forgot password should return 422 for empty username/email', async () => {
    const provider = 'facebook';
    user.provider = provider;
    user.roles = ['user'];

    await user.save();
    const res = await agent
      .post('/api/v1/auth/forgot')
      .send({
        username: '',
      })
      .expect(422);
    res.body.message.should.equal('Le champ Nom d\'utilisateur ne doit pas être vide');
  });

  it('forgot password should return 422 for no username or email provided', async () => {
    const provider = 'facebook';
    user.provider = provider;
    user.roles = ['user'];

    await user.save();
    const res = await agent
      .post('/api/v1/auth/forgot')
      .send({})
      .expect(422);
    res.body.message.should.equal('Le champ Nom d\'utilisateur ne doit pas être vide');
  });

  it('forgot password should return 400 for non-local provider set for the user object', async () => {
    const provider = 'facebook';
    user.provider = provider;
    user.roles = ['user'];

    await user.save();
    const res = await agent
      .post('/api/v1/auth/forgot')
      .send({
        username: user.username,
      })
      .expect(400);
    res.body.message.should.equal(
      `Il semble que vous vous êtes inscrit en utilisant votre compte "${
        user.provider
      }", connectez-vous en utilisant ce fournisseur.`,
    );
  });

  it('forgot password should be able to reset password for user password reset request using username', async () => {
    user.roles = ['user'];

    await user.save();

    await agent
      .post('/api/v1/auth/forgot')
      .send({
        username: user.username,
      })
      .expect(200);

    const u = await User.findOne({ username: user.username.toLowerCase() });

    u.resetPasswordToken.should.not.be.empty();

    should.exist(u.resetPasswordExpires);
  });

  it('forgot password should be able to reset password for user password reset request using email', async () => {
    user.roles = ['user'];

    await user.save();

    await agent
      .post('/api/v1/auth/forgot')
      .send({
        username: user.email,
      })
      .expect(200);

    const u = await User.findOne({ email: user.email.toLowerCase() });

    u.resetPasswordToken.should.not.be.empty();

    should.exist(u.resetPasswordExpires);
  });

  it('forgot password should be able to reset the password using reset token', async () => {
    user.roles = ['user'];

    await user.save();

    await agent
      .post('/api/v1/auth/forgot')
      .send({
        username: user.email,
      })
      .expect(200);

    const u = await User.findOne({ email: user.email.toLowerCase() });

    u.resetPasswordToken.should.not.be.empty();
    should.exist(u.resetPasswordExpires);

    await agent
      .post(`/api/v1/auth/reset/${u.resetPasswordToken}`)
      .expect(200)
      .send({
        newPassword: credentials.password,
        verifyPassword: credentials.password,
      });
  });

  it('forgot password should return error when using invalid reset token', async () => {
    user.roles = ['user'];

    await user.save();

    await agent
      .post('/api/v1/auth/forgot')
      .send({
        username: user.email,
      })
      .expect(200);

    const invalidToken = 'someTOKEN1234567890';

    const res = await agent
      .post(`/api/v1/auth/reset/${invalidToken}`)
      .expect(400)
      .send({
        newPassword: credentials.password,
        verifyPassword: credentials.password,
      });

    res.body.message.should.equal('Utilisateur non trouvé!');
  });

  it('should be able to change user own password successfully', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);

    const res = await agent
      .post('/api/v1/auth/password')
      .send({
        newPassword: '1234567890Aa$',
        verifyPassword: '1234567890Aa$',
        currentPassword: credentials.password,
      })
      .expect(200);

    res.body.message.should.equal('Le mot de passe a été changé avec succès');
  });

  it('should not be able to change user own password if wrong verifyPassword is given', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);

    const res = await agent.post('/api/v1/auth/password').send({
      newPassword: '1234567890Aa$',
      verifyPassword: '1234567890-ABC-123-Aa$',
      currentPassword: credentials.password,
    });

    res.body.message.should.equal('Les mots de passe ne correspondent pas');
  });

  it('should not be able to change user own password if wrong currentPassword is given', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);

    const res = await agent.post('/api/v1/auth/password').send({
      newPassword: '1234567890Aa$',
      verifyPassword: '1234567890Aa$',
      currentPassword: 'some_wrong_passwordAa$',
    });

    res.body.message.should.equal('Le mot de passe est incorrect');
  });

  it('should not be able to change user own password if no new password is at all given', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);

    const res = await agent
      .post('/api/v1/auth/password')
      .send({
        newPassword: '',
        verifyPassword: '',
        currentPassword: credentials.password,
      })
      .expect(422);

    res.body.message.should.equal('Veuillez fournir un nouveau mot de passe');
  });

  it('should return null of an unauthenticated user', async () => {
    const res = await agent.get('/api/v1/auth/name').expect(200);
    should.equal(res.body, null);
  });

  it('should be able to get the fullname of an authenticated user', async () => {
    user.roles = ['user'];

    await user.save();

    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);

    const res = await agent.get('/api/v1/auth/name').expect(200);

    res.body.fullname.should.equal(user.name.full);
  });

  it('should not be able to change user own password if not signed in', async () => {
    const res = await request
      .agent(app)
      .post('/api/v1/auth/password')
      .send({
        newPassword: '1234567890Aa$',
        verifyPassword: '1234567890Aa$',
        currentPassword: credentials.password,
      })
      .expect(401);
    res.body.message.should.equal('User is not signed in');
  });

  it('should be able to get own user details successfully', async () => {
    await agent
      .post('/api/v1/auth/signin')
      .send(credentials)
      .expect(200);

    const res = await agent.get('/api/v1/me').expect(200);
    res.body.should.be.instanceof(Object);
    res.body.username.should.equal(user.username);
    res.body.email.should.equal(user.email);
    should.not.exist(res.body.salt);
    should.not.exist(res.body.password);
    should.not.exist(res.body.validations);
  });

  it('should return null when getting user details if not authenticated', async () => {
    // Get own user details
    const res = await agent.get('/api/v1/me').expect(200);
    should.equal(null, res.body);
  });

  afterEach(async () => {
    await User.remove();
  });
});
