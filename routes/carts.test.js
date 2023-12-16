const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, adminToken, u1Token, u2Token } = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /carts/:username/checkout", function(){
    test("doesn't work if not same user", async function(){
        const resp = await request(app)
        .post('/carts/U1/checkout')
        .set({'authorization': `${u2Token}`});
        expect(resp.statusCode).toEqual(401);
    });
    test("works if same user", async function(){
        const resp = await request(app)
        .post('/carts/U1/checkout')
        .set('authorization', `${u1Token}`);
        expect(resp.statusCode).toEqual(200);
    })
});