const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, adminToken, u1Token } = require("./_testCommon");
const db = require("../db");
const Genre = require("../models/genre");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /genres/", function(){
    test("works for anon", async function(){
        const resp = await request(app)
        .get('/genres/')
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    });
    test("works if admin", async function(){
        const resp = await request(app)
        .get('/genres/')
        .set('authorization', `${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    })
});

describe("GET /genres/:id", function(){
    let genreID = 0;
    test("works for anon", async function(){
        const genre = await Genre.findAll();
        genreID = genre[0].id;
        const resp = await request(app)
        .get(`/genres/${genreID}`)
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Object));
    });
    test("works if admin", async function(){
        const resp = await request(app)
        .get(`/genres/${genreID}`)
        .set('authorization', `${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Object));
    })
});

describe("POST /genres/", function(){
    test("doesn't work for non-admin", async function(){
        const resp = await request(app)
        .post(`/genres/`)
        .set({'authorization': `${u1Token}`})
        .send({name: "death"});
        expect(resp.statusCode).toEqual(401);
    });
    test("works if admin", async function(){
        const resp = await request(app)
        .post(`/genres/`)
        .set('authorization', `${adminToken}`)
        .send({name: "death"});
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual(expect.any(Object));
    })
});