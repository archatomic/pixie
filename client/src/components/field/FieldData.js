import { def, isDefined } from 'Pixie/util/default'

export class FieldData {
  /**
   * @param {any} [data = {}]
   * @param {(string|number)[]} [path = []]
   * @param {FieldData} [root = this]
   */
  constructor (data = {}, path = [], root = null) {
    this.raw = data
    this.root = def(root, this)
    this.path = path
  }

  get (path) {
    let current = this.raw

    for (const prop of path) {
      if (!isDefined(current)) break
      current = current && current[prop]
    }

    return new FieldData(
      def(current, null),
      [...this.path, ...path],
      this.root
    )
  }

  set (path, value) {
    let current = this.raw
    const prop = path.pop()

    for (const prop of path) {
      if (!isDefined(current)) return false
      current = current && current[prop]
    }

    if (!current) return false
    current[prop] = value
    return true
  }
}
