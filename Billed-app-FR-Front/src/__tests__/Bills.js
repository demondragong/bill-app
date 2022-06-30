/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";



import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {


      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    // test("Then there is a new bill button", () => {
    //   const newBillButton = screen.getByTestId('btn-new-bill')
    //   expect(newBillButton).toBeInTheDocument()
    // })
    // test("Then each bill line has an eye icon", () => {
    //   const newBillButton = screen.getByTestId('icon-eye')
    // })
  })
  // describe('When I am on the Bills page and there are no bills', () => {
  //   test('Then, the table should be empty', () => {
  //     document.body.innerHTML = cards([])
  //     const iconEdit = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')
  //     expect(iconEdit).toBeNull()
  //   })
  // })
  describe('When I am on Bills page and I click on New Bill', () => {
    test('Then, I am redirected to the new bill page', () => {
      
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsContainer = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const handleClickButton = jest.fn(billsContainer.handleClickButton)
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickButton)
      userEvent.click(newBillButton)
      expect(handleClickButton).toHaveBeenCalled()
      // expect the form to record a new bill to be visible
      expect(screen.getByTestId("form-new-bill")).toBeVisible()
    })
  })

  describe('When I am on Bills page and I click on the eye icon next to a bill', () => {
    test("Then the bill's proof image should show", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsContainer = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      // get the first eye icon available
      const eye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye(eye))
      
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
      // expect the modal with the file image to be visible
      expect(screen.getByTestId("modaleFile")).toBeTruthy()
    })
  })

})
