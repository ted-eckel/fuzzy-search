import React, { Component } from 'react'

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      files: [],
      search: '',
      results: []
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.fuzzy = this.fuzzy.bind(this)
    this.matchFileName = this.matchFileName.bind(this)
  }

  componentWillMount() {
    fetch('./fuzzy_find_files.json')
    .then(res => res.json())
    .then(obj => this.setState({files: obj.files}))
    .then(() => this.setState({results: this.fuzzy('').slice(0,10)}))
  }

  fuzzy(search) {
    let matchFileName = this.matchFileName;
    return this.state.files.reduce((accum, el, idx) => {
      let str = el
      let file = matchFileName(search, str)
      if(file != null) {
        accum[accum.length] = {
          string: file.name,
          weight: file.weight,
          index: idx
        }
      }
      return accum
    }, []).sort((a,b) => {
      let compare = b.weight - a.weight
      if(compare) {
        return compare
      }
      return a.index - b.index
    })
  }

  matchFileName(search, str) {
    let searchIdx = 0,
      result = [],
      total = 0,
      weight = 0,
      match = str.toLowerCase(),
      char;

    search = search.toLowerCase()

    for(let idx = 0; idx < str.length; idx++) {
      char = str[idx]
      if(match[idx] === search[searchIdx]) {
        char = '<b>' + char + '</b>'
        searchIdx += 1
        weight += 1 + weight
      } else {
        weight = 0
      }
      total += weight
      result[result.length] = char
    }
    if(searchIdx === search.length) {
      total = (match === search) ? Infinity : total
      return {name: result.join(''), weight: total}
    }

    return null
  }

  handleSearch(text) {
    this.setState({
      search: text,
      results: this.fuzzy(text).slice(0,10)
    })
  }

  render() {
    return (
      <div>
        <SearchBar
          search={this.state.search}
          handleSearch={this.handleSearch}
          handleBlur={this.handleBlur}
        />
        <FileList results={this.state.results} search={this.state.search} />
      </div>
    );
  }
}

class SearchBar extends Component {
  constructor(props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
  }

  handleSearch(e) {
    this.props.handleSearch(e.target.value)
  }

  render() {
    return (
      <form>
        <input
          type='text'
          placeholder='Find files...'
          value={this.props.search}
          onChange={this.handleSearch}
        />
      </form>
    )
  }
}

class FileList extends Component {
  render() {
    return (
      <div>
        {this.props.results.map((result, idx) => {
          return (
            <div dangerouslySetInnerHTML={{__html: result.string}} key={idx}></div>
          )
        })}
      </div>
    )
  }
}

export default App;
