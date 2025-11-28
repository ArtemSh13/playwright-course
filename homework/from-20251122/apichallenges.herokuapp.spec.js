import { test, request, expect } from '@playwright/test'

let context

test.beforeAll(async ({ playwright, request }) => {
    const baseURL = 'https://apichallenges.herokuapp.com'
    const xChallengerToken = (await request.post(`${baseURL}/challenger`)).headers()['x-challenger']
    console.log(xChallengerToken)
    context = await playwright.request.newContext({
        baseURL: baseURL,
        extraHTTPHeaders: {
            'X-Challenger': xChallengerToken
        }
    })
})

test.afterAll(async ({ }) => {
    await context.dispose();
})

test.describe('GET Challenges', async () => {
    test('06 GET /todos/{id} (404)', async ({ }) => {
        const invalidID = 404

        const response = await context.get(`/todos/${invalidID}`)

        expect(response.status()).toEqual(404)
    })
})

test.describe('HEAD Challenges', async () => {
    test('08 HEAD /todos (200)', async () => {
        const response = await context.head('todos')

        expect(response.status()).toEqual(200)
    })
})

test.describe('Creation Challenges with POST', async () => {
    test('09 POST /todos (201)', async () => {
        const toDo = {
            'title': 'write an API test',
            'doneStatus': false,
            'description': ''
        }

        const response = await context.post('/todos', { data: toDo })
        const responseBody = await response.json()

        expect(response.status()).toEqual(201)
        expect(responseBody['title']).toEqual(toDo.title)
        expect(responseBody['doneStatus']).toEqual(toDo.doneStatus)
        expect(responseBody['description']).toEqual(toDo.description)
    })

    test('12 POST /todos (400) description too long', async () => {
        const tooLongDescription = 'qwertyuiopasdfghjklzxcvbnm1234567890qwertyuiopasdfghjklzxcvbnm1234567890qwertyuiopasdfghjklzxcvbnm1234567890qwertyuiopasdfghjklzxcvbnm1234567890qwertyuiopasdfghjklzxcvbnm1234567890qwertyuiopasdfghjklzx'
        const toDo = {
            'title': 'fail a POST request',
            'doneStatus': false,
            'description': tooLongDescription
        }
        const expectedErrorMessage = 'Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200'

        const response = await context.post('/todos', { data: toDo })
        const responseBody = await response.json()

        expect(response.status()).toEqual(400)
        expect(responseBody['errorMessages'][0]).toEqual(expectedErrorMessage)
    })
})