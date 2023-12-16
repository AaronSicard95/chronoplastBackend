const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, 
commonAfterAll, adminToken, u1Token, u2Token, listingID } = require("./_testCommon");
const Listing = require("../models/listing");
const Cart = require("../models/cart");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /users/", function(){
    test("doesn't work if not admin", async function(){
        const resp = await request(app)
        .get('/users/')
        .set({'authorization': `${u1Token}`});
        expect(resp.statusCode).toEqual(401);
    });
    test("works if admin", async function(){
        const resp = await request(app)
        .get('/users/')
        .set('authorization', `${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    })
});

describe("GET /users/:username", function(){
    test("doesn't work for wrong user", async function(){
        const resp = await request(app)
        .get('/users/U1')
        .set('authorization', u2Token);
        expect(resp.statusCode).toEqual(401);
    })
    test("works for right user", async function(){
        const resp = await request(app)
        .get('/users/U1')
        .set('authorization', u1Token);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Object));
    })
});

describe("/users/:username/cart", function(){
    let initialCount = 0;
    test("doesn't work for wrong user", async function(){
        const resp = await request(app)
        .get('/users/U1/cart')
        .set('authorization', u2Token);
        expect(resp.statusCode).toEqual(401);
    })
    test("works for admin", async function(){
        const resp = await request(app)
        .get('/users/U1/cart')
        .set('authorization', adminToken);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
    })
    test("works for user add and remove", async function(){
        const resp = await request(app)
        .get('/users/U1/cart')
        .set('authorization', u1Token);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.any(Array));
        initialCount = resp.body.length;
    })
    test("adds to and removes from cart", async function(){
        const listings = await Listing.getAllListings();
        const listingID = listings[0].id;
        let resp = await request(app)
        .post(`/users/U1/cart/${listingID}`)
        .set('authorization', u1Token);
        expect(resp.statusCode).toEqual(201);
        let check = await request(app)
        .get('/users/U1/cart')
        .set('authorization', u1Token);
        expect(check.body.length).toEqual(initialCount+1);
        resp = await request(app)
        .delete(`/users/U1/cart/${listingID}`)
        .set('authorization', u1Token);
        expect(resp.statusCode).toEqual(200);
        check = await request(app)
        .get(`/users/U1/cart`)
        .set('authorization', u1Token);
        expect(check.body.length).toEqual(initialCount);
    })
})

describe("POST /users/:username/password", function(){
    test("doesn't work if not same user", async function(){
        const resp = await request(app)
        .post('/users/U1/password')
        .set({'authorization': `${u2Token}`});
        expect(resp.statusCode).toEqual(401);
    });
    test("works if same user", async function(){
        const resp = await request(app)
        .post('/users/U1/password')
        .set('authorization', `${u1Token}`)
        .send({password: "password1"});
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(true);
    })
});