interface Feature {
  tagName: string
  xmlns: string
}

export class StreamContext {
  private _context = {}

  private _features: Feature[] = []

  clear() {
    this._context = {}
  }

  setFeatures(features: Feature[]) {
    this._features = features
  }
}
