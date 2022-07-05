/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { waitFor, fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee', email: "a@a.com"
  }))

  describe("When I am on NewBill Page", () => {
    document.body.innerHTML = '<div id="root"></div>'
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
    
    test("Then I should read the title 'Envoyer une note de frais'", () => {
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
    test("Then I should see a submit button", () => {
      expect(screen.getByText('Envoyer')).toBeTruthy()
    })
    test("Then window icon on the left menu should not be highlighted", () => {
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).not.toHaveClass('active-icon')
    })
    test("Then mail icon on the left menu should  be highlighted", () => {
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })
    describe("When I try to upload a file that is not an image (jpg, jpeg or png)", () => {
      test('Then the file should not be accepted and I should see an error message giving the expected file extension', () => {

        const newBill = new NewBill({
          document,
          onNavigate,
          mockStore,
          localStorage: window.localStorage,
        });
  
        const fileInput = screen.getByTestId("file")
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        fileInput.addEventListener("change", handleChangeFile)

        // mocking a file that is not of the expected type (pdf instead of image)
        const badFile = new File([''], '', { type: 'application/pdf' })
        const event = { target: {files: [badFile] } }

        fireEvent.change(fileInput, event)
        expect(handleChangeFile).toHaveBeenCalled()

        // check that the file has not been accepted, i.e. the Justificatif field is still empty
        expect(fileInput.value).toBeFalsy()

        // check that the error message is displayed
        const errorMessage = screen.getByTestId("file-extension-error")
        expect(errorMessage).toBeVisible()

      })
    })
    describe("When I try to upload an image (jpg, jpeg or png)", () => {
      test('Then the file should be accepted in the input and I should not see an error message', async () => {

        const newBill = new NewBill({
          document,
          onNavigate,
          mockStore,
          localStorage: window.localStorage,
        });
  
        const fileInput = screen.getByTestId("file")
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        fileInput.addEventListener("change", handleChangeFile)

        // mocking an image file
        const goodFile = new File(['hello'], 'hello.png', {type: 'image/png'})
        userEvent.upload(fileInput, goodFile)

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0]).toStrictEqual(goodFile)

        // check that the file has been accepted, i.e. the Justificatif field is not empty
        // await waitFor(() => expect(fileInput.value).toBeTruthy())
        // confirm that the error message is not displayed
        // const errorMessage = screen.getByTestId("file-extension-error")
        // expect(errorMessage).not.toBeVisible()

      })
    })
  })

  // Test d'intégration POST
  describe('When I do fill fields in correct format and I click on submit button', () => {
    test('Then newBill should be created', async () => {
      // we have to use mockStore to simulate bill creation
      const updateBill = mockStore.bills().update()
      const addedBill = await updateBill.then((value) => {
        return value
      })

      expect(addedBill.id).toEqual('47qAXb6fIm2zOKkLzMro')
      expect(addedBill.amount).toEqual(400)
      expect(addedBill.fileUrl).toEqual('https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a')
    })

    describe("When an error occurs on API", () => {
      test("Then fetch error 500 from API", async () => {
        jest.spyOn(mockStore, 'bills')
        console.error = jest.fn()

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        document.body.innerHTML = `<div id="root"></div>`
        router()
        window.onNavigate(ROUTES_PATH.NewBill)

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update : () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          }
        })
        const newBill = new NewBill({document,  onNavigate, store: mockStore, localStorage: window.localStorage})
      
        // Submit form
        const form = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        form.addEventListener('submit', handleSubmit)

        fireEvent.submit(form)
        await new Promise(process.nextTick)
        expect(console.error).toBeCalled()
      })
    })
  })
})