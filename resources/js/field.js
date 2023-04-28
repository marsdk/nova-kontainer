import IndexField from './components/IndexField'
import DetailField from './components/DetailField'
import FormField from './components/FormField'

Nova.booting((app, store) => {
  app.component('index-nova-kontainer', IndexField)
  app.component('detail-nova-kontainer', DetailField)
  app.component('form-nova-kontainer', FormField)
})
