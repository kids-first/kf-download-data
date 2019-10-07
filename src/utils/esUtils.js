import noop from 'lodash/noop';
import defaults from 'lodash/defaults';

export const executeSearchAfterQuery = async (es, index, query, opts = {}) => {
  console.time('executeSearchAfterQuery');

  opts = defaults(opts, {
    onPageFetched: noop,
    onFinish: noop,
    size: 1000,
  });

  // wrap values in an object to prevent closure bugs
  let progress = {
    total: 0,
    fetched: 0,
  };

  const fetchNextPage = async (sort = null) => {
    console.time(`fetchNextPage ${sort}`);

    const searchParams = {
      index,
      body: {
        ...query,
        // "size" is necessary to activate "search_after"
        size: opts.size || query.size,
      },
    };

    // omit "search_after" on first call
    if (sort) {
      searchParams.body.search_after = sort;
    }

    let page;
    try {
      page = await es.search(searchParams);
    } catch (err) {
      console.error(`Error searching ES with params ${JSON.stringify(searchParams)}`, err);
      throw err;
    }
    progress.total = page.hits.total;
    const pageSize = page.hits.hits.length;
    progress.fetched += pageSize;

    // a page may be empty if data has been removed from the search results in between two calls,
    //  preventing this search from reaching fetched = total.
    // Be sure not to go in an infinite loop if that happen.
    if (pageSize > 0) {
      opts.onPageFetched(page.hits.hits.map(hit => hit._source), progress.total);
    }
    if (progress.fetched >= progress.total || pageSize === 0) {
      opts.onFinish();
      return;
    }

    console.timeEnd(`fetchNextPage ${sort}`);
    await fetchNextPage(page.hits.hits[pageSize - 1].sort);
  };

  let otherPagesPromise;
  try {
    otherPagesPromise = await fetchNextPage();
  } catch (err) {
    console.error(`Failed to search ES for index: ${index}, query: ${JSON.stringify(query)}`, err);
    console.timeEnd('executeSearchAfterQuery');
    throw err;
  }

  console.timeEnd('executeSearchAfterQuery');
  return otherPagesPromise;
};
