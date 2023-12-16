const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, adminToken, u1Token } = require("./_testCommon");
const Band = require("../models/band");
const Record = require("../models/record");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /bands/", function(){
    test("works for anon", async function(){
        const resp = await request(app)
        .get('/bands/')
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    });
    test("works for user", async function(){
        const resp = await request(app)
        .get('/bands/')
        .set('authorization', `${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    })
});

describe("GET /bands/:id", function(){
    test("works for anon", async function(){
        const bands = await Band.findAllBands();
        const bandID = bands[0].id;
        const resp = await request(app)
        .get(`/bands/${bandID}`)
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Object));
    });
    test("works for user", async function(){
        const bands = await Band.findAllBands();
        const bandID = bands[0].id;
        const resp = await request(app)
        .get(`/bands/${bandID}`)
        .set('authorization', `${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Object));
    })
});

describe("POST /bands/", function(){
    test("doesn't work for anon", async function(){
        const resp = await request(app)
        .post(`/bands/`)
        .send({
            name:"Cool band",
            bio:"Cool"
        });
        expect(resp.statusCode).toEqual(401);
    });
    test("doesn't work for non-admin user", async function(){
        const resp = await request(app)
        .post(`/bands/`)
        .set('authorization', u1Token)
        .send({
            name:"Cool band",
            bio:"Cool"
        });
        expect(resp.statusCode).toEqual(401);
    });
    test("works for admin", async function(){
        const bands = await Band.findAllBands();
        const bandID = bands[0].id;
        const resp = await request(app)
        .post(`/bands/`)
        .set('authorization', `${adminToken}`)
        .send({
            name:"Cool band",
            bio:"Cool",
            genres: ["death"],
            origin: "Florida"
        });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({name: "Cool band", bio: "Cool", 
        id: expect.any(Number), imageurl: expect.any(String), origin: "Florida"});
    })
});

describe("PATCH /bands/:id", function(){
    let bandID = 0;
    test("doesn't work for anon", async function(){
        const bands = await Band.findAllBands();
        bandID = bands[0].id
        const resp = await request(app)
        .patch(`/bands/${bandID}`)
        .send({
            bio:"I changed the Bio!"
        });
        expect(resp.statusCode).toEqual(401);
    });
    test("doesn't work for non-admin user", async function(){
        const resp = await request(app)
        .patch(`/bands/${bandID}`)
        .set('authorization', u1Token)
        .send({
            bio:"I changed the Bio!"
        });
        expect(resp.statusCode).toEqual(401);
    });
    test("works for admin", async function(){
        const bands = await Band.findAllBands();
        const bandID = bands[0].id;
        const resp = await request(app)
        .patch(`/bands/${bandID}`)
        .set('authorization', `${adminToken}`)
        .send({
            bio:"I changed the Bio!"
        });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.bio).toEqual("I changed the Bio!");
    })
});

describe("DELETE /bands/:id", function(){
    let bandID = 0;
    test("doesn't work for anon", async function(){
        const bands = await Band.findAllBands();
        bandID = bands[0].id
        const resp = await request(app)
        .delete(`/bands/${bandID}`)
        expect(resp.statusCode).toEqual(401);
    });
    test("doesn't work for non-admin user", async function(){
        const resp = await request(app)
        .delete(`/bands/${bandID}`)
        .set('authorization', u1Token)
        expect(resp.statusCode).toEqual(401);
    });
    test("works for admin", async function(){
        const bands = await Band.findAllBands();
        const bandID = bands[0].id;
        const resp = await request(app)
        .delete(`/bands/${bandID}`)
        .set('authorization', `${adminToken}`)
        console.log(resp.body);
        expect(resp.statusCode).toEqual(200);
        const check = await request(app)
        .get(`/bands/${bandID}`)
        .set('authorization', adminToken);
        console.log(check.body);
        expect(check.status).toEqual(404);
    })
});