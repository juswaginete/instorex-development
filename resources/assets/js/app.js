import './bootstrap'

/**
 * @typedef {{
 *   id: number,
 *   parent: string,
 *   text: string,
 *   path: string,
 *   virtual_path: string,
 *   type: string,
 *   size: number,
 *   thumb: string,
 *   date_uploaded: string,
 *   playlists: Object<{string, string}>,
 *   deletable: boolean
 * }} ContentFile
 */

/**
 * @typedef {{
 *   a_attr: Object,
 *   children: Array,
 *   children_d: Array,
 *   data: undefined,
 *   icon: boolean,
 *   id: string,
 *   li_attr: Object,
 *   original: Object,
 *   parent: string,
 *   parents: Array.<string>,
 *   state: {
 *     loaded: boolean,
 *     opened: boolean,
 *     disabled: boolean,
 *     selected: boolean
 *   },
 *   text: string
 * }} JSTreeNode
 */

const path = document.location.pathname

if (path === '/contents') {
  require('./pages/contents/index')
} else if (path === '/playlists') {
  require('./pages/playlists/index')
} else if (path === '/image-editor') {
  require('./pages/image-editor')
// } else if (path === '/playlists/create') {
//   require('./pages/playlists/create')
// } else if (path.match(/^\/playlists\/[0-9]+\/?$/)) {
//   require('./pages/playlists/show')
} else if (path.match(/^\/playlists\/[0-9]+\/edit\/?$/)) {
  require('./pages/playlists/edit')
}
