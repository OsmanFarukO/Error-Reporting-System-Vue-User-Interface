import Vue from 'vue'
import Router from 'vue-router'
import StartPage from '@/components/StartPage'
import Dashboard from '@/components/Dashboard'
import AppAdmin from '@/components/AppAdmin'
import Customers from '@/components/admin/Customers'
import AddCustomers from '@/components/admin/AddCustomers'
import CustomerProfile from '@/components/admin/CustomerProfile'
import Materials from '@/components/admin/Materials'
import AddMaterial from '@/components/admin/AddMaterial'
import Employees from '@/components/admin/Employees'
import AddEmployee from '@/components/admin/AddEmployee'
import EmployeeProfile from '@/components/admin/EmployeeProfile'
import CustomerIssues from '@/components/admin/CustomerIssues'
import CorporationIssues from '@/components/admin/CorporationIssues'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'StartPage',
      component: StartPage
    }, {
      path: '/dashboard',
      component: AppAdmin,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'employees',
          name: 'Employees',
          component: Employees,
          children: [
            {
              path: '/add',
              name: 'AddEmployee',
              component: AddEmployee
            },
            {
              path: '/:emp',
              name: 'EmployeeProfile',
              component: EmployeeProfile
            }
          ]
        },
        {
          path: 'customers',
          name: 'Customers',
          component: Customers,
          children: [
            {
              path: '/add',
              name: 'Add',
              component: AddCustomers
            },
            {
              path: '/:profile',
              name: 'CustomerProfile',
              component: CustomerProfile
            }
          ]
        },
        {
          path: 'materials',
          name: 'Materials',
          component: Materials,
          children: [
            {
              path: 'add',
              name: 'AddMaterial',
              component: AddMaterial
            }
          ]
        },
        {
          path: 'issues',
          name: 'CustomerIssues',
          component: CustomerIssues
        },
        {
          path: 'corpissues',
          name: 'CorporationIssues',
          component: CorporationIssues
        }
      ]
    }
  ]
})
