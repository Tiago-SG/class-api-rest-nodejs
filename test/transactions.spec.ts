import { test, beforeAll, afterAll, describe, expect, beforeEach} from 'vitest'
import { app } from '../src/app';
import request from 'supertest'
import { execSync } from 'child_process';

describe('Trasnactions routes', () => {
  beforeAll(async ()=> {
    await app.ready()
  })
  
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })
  

  test('user can create a new transaction', async () => {
    await request(app.server).post('/transactions').send({
      title: "Salgado",
      amount: 7.5,
      type: 'debit'
    }).expect(201);
  })



  test( 'should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "Salgado",
      amount: 7.5,
      type: 'debit'
    })
    const cookies: any = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "Salgado",
        amount: -7.5,
      })
    ])
  })



  test( 'should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "farcry5 PS4",
      amount: 60,
      type: 'credit'
    })
    const cookies: any = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookies)
    .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "farcry5 PS4",
        amount: 60,
      })
    )
  })



  test( 'should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "Venda PS4",
      amount: 1400,
      type: 'credit'
    })

    const cookies: any = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send({
      title: "Compra PS5",
      amount: 3400,
      type: 'debit'
    })

    const summaryResponse = await request(app.server)
    .get('/transactions/summary')
    .set('Cookie', cookies)
    .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: -2000
    })
  })


})

