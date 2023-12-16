const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, adminToken, u1Token } = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /records/", function(){
    test("works for anon", async function(){
        const resp = await request(app)
        .get('/records/')
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    });
    test("works if admin", async function(){
        const resp = await request(app)
        .get('/records/')
        .set('authorization', `${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    })
});