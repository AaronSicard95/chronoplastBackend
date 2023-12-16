const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, adminToken, u1Token } = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /payments/", function(){
    test("doesn't work if not admin", async function(){
        const resp = await request(app)
        .post('/payments/')
        .set({'authorization': `${u1Token}`})
        .send({amount: 1000000});
        expect(resp.statusCode).toEqual(401);
    });
    test("works if admin", async function(){
        const resp = await request(app)
        .post('/payments/')
        .set('authorization', `${adminToken}`)
        .send({amount: 1000000});
        expect(resp.statusCode).toEqual(201);
    })
});