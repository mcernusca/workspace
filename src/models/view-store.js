import MakeStore from './make-store'
import reducer from './reducer'

const Store = MakeStore(reducer)

export default Store
