import MakeStore from './make-store'
import reducer from './space-reducer'

const Store = MakeStore(reducer)

export default Store
