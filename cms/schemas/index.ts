/**
 * Sanity schema registry — import this array into the Studio's
 * schema config once the Sanity project exists.
 */
import product from './product';
import anatomyArea from './anatomyArea';
import clinicalImage from './clinicalImage';
import innovationItem from './innovationItem';
import research from './research';
import page from './page';
import news from './news';
import siteSettings from './siteSettings';

export const schemaTypes = [
  product,
  anatomyArea,
  clinicalImage,
  innovationItem,
  research,
  page,
  news,
  siteSettings,
];
