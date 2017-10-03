import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  HierarchicalMenuFilter, HitsStats, SortingSelector, NoHits,
  ResetFilters, RangeFilter, NumericRefinementListFilter,
  ViewSwitcherHits, ViewSwitcherToggle, DynamicRangeFilter,
  InputFilter, GroupedSelectedFilters, AccessorManager,
  Layout, TopBar, LayoutBody, LayoutResults, Hits, Utils,
  ActionBar, ActionBarRow, SideBar, ViewSwitcherConfig } from 'searchkit'

var ReactDOMServer = require('react-dom/server')
import React from 'react'
import Head from 'next/head'

const MovieHitsGridItem = (props)=> {
  const {bemBlocks, result} = props
  let url = "http://www.imdb.com/title/" + result._source.imdbId
  const source = Object.assign({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" className={bemBlocks.item("poster")} src={result._source.poster} width="170" height="240"/>
        <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}>
        </div>
      </a>
    </div>
  )
}

const MovieHitsListItem = (props)=> {
  const {bemBlocks, result} = props
  let url = "http://www.imdb.com/title/" + result._source.imdbId
  const source:any = Object.assign({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("poster")}>
        <img data-qa="poster" src={result._source.poster}/>
      </div>
      <div className={bemBlocks.item("details")}>
        <a href={url} target="_blank"><h2 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}></h2></a>
        <h3 className={bemBlocks.item("subtitle")}>Released in {source.year}, rated {source.imdbRating}/10</h3>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.plot}}></div>
      </div>
    </div>
  )
}

const host = "http://demo.searchkit.co/api/movies"

let searchCode =  (searchkit)=> {
  return (
    <SearchkitProvider searchkit={searchkit}>
      <Layout>
        <TopBar>
          <div className="my-logo">Searchkit Acme co</div>
          <SearchBox autofocus={true} searchOnChange={true} prefixQueryFields={["actors^1","type^2","languages","title^10"]}/>
        </TopBar>

      <ViewSwitcherConfig
        hitComponents = {[
          {key:"grid", title:"Grid", itemComponent:MovieHitsGridItem, defaultOption:true},
          {key:"list", title:"List", itemComponent:MovieHitsListItem}
        ]}
      />
      <LayoutBody>

        <SideBar>
          <HierarchicalMenuFilter fields={["type.raw", "genres.raw"]} title="Categories" id="categories"/>
          <DynamicRangeFilter field="metaScore" id="metascore" title="Metascore" rangeFormatter={(count)=> count + "*"}/>
          <RangeFilter min={0} max={10} field="imdbRating" id="imdbRating" title="IMDB Rating" showHistogram={true}/>
          <InputFilter id="writersinput" searchThrottleTime={500} title="Writers" placeholder="Search writers" searchOnChange={true} queryFields={["writers"]} />
          <RefinementListFilter id="actors" title="Actors" field="actors.raw" size={10}/>
          <RefinementListFilter translations={{"facets.view_more":"View more writers"}} id="writers" title="Writers" field="writers.raw" operator="OR" size={10}/>
          <RefinementListFilter id="countries" title="Countries" field="countries.raw" operator="OR" size={10}/>
          <NumericRefinementListFilter id="runtimeMinutes" title="Length" field="runtimeMinutes" options={[
            {title:"All"},
            {title:"up to 20", from:0, to:20},
            {title:"21 to 60", from:21, to:60},
            {title:"60 or more", from:61, to:1000}
          ]}/>
        </SideBar>
        <LayoutResults>
          <ActionBar>

            <ActionBarRow>
              <HitsStats translations={{
                "hitstats.results_found":"{hitCount} results found"
              }}/>
              <ViewSwitcherToggle/>
              <SortingSelector options={[
                {label:"Relevance", field:"_score", order:"desc"},
                {label:"Latest Releases", field:"released", order:"desc"},
                {label:"Earliest Releases", field:"released", order:"asc"}
              ]}/>
            </ActionBarRow>

            <ActionBarRow>
              <GroupedSelectedFilters/>
              <ResetFilters/>
            </ActionBarRow>

          </ActionBar>
          <ViewSwitcherHits
              hitsPerPage={12} highlightFields={["title","plot"]}
              sourceFilter={["plot", "title", "poster", "imdbId", "imdbRating", "year"]}
              scrollTo={false}
          />
          <NoHits suggestionsField={"title"}/>
          <Pagination showNumbers={true}/>
        </LayoutResults>

        </LayoutBody>
      </Layout>
    </SearchkitProvider>
  )
}

export default class MainPage extends React.Component {

  constructor(props) {
    super(props)
    let isServer = typeof window === 'undefined'
    this.searchkit = new SearchkitManager(host, {
      useHistory: !isServer,
      searchOnLoad:false
    }, {
      results:props.results,
      state:props.state
    })
  }

  static async getInitialProps(props) {
    const { pathname, query, asPath } = props
    let searchPath = asPath.split('?')[1] || ''
    let searchkit = new SearchkitManager(host, {
      useHistory: false,
      searchOnLoad:false
    })
    ReactDOMServer.renderToString(searchCode(searchkit))
    return searchkit.searchFromUrlQuery(searchPath)      
  }

  render() {
    return (
      <div>
        <Head>
          <title>Searchkit</title>
          <link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/searchkit/0.10.0/theme.css" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        {searchCode(this.searchkit)}
      </div>
    )
  }
}
