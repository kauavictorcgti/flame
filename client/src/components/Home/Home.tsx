import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../store/reducers';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../../store';

// Typescript
import { App, Category } from '../../interfaces';

// UI
import { Icon, Container, SectionHeadline, Spinner, Message } from '../UI';

// CSS
import classes from './Home.module.css';

// Components
import { AppGrid } from '../Apps/AppGrid/AppGrid';
import { BookmarkGrid } from '../Bookmarks/BookmarkGrid/BookmarkGrid';
import { SearchBar } from '../SearchBar/SearchBar';
import { Header } from './Header/Header';

// Utils
import { escapeRegex } from '../../utility';
import { regexSearch } from '../../utility/regexSearch';

export const Home = (): JSX.Element => {
  const {
    apps: { apps, loading: appsLoading },
    bookmarks: { categories, loading: bookmarksLoading },
    config: { config },
    auth: { isAuthenticated },
  } = useSelector((state: State) => state);

  const dispatch = useDispatch();
  const { getApps, getCategories } = bindActionCreators(
    actionCreators,
    dispatch
  );

  // Local search query
  const [localSearch, setLocalSearch] = useState<null | string>(null);
  const [appSearchResult, setAppSearchResult] = useState<null | App[]>(null);
  const [bookmarkSearchResult, setBookmarkSearchResult] = useState<
    null | Category[]
  >(null);

  // Load applications
  useEffect(() => {
    if (!apps.length) {
      getApps();
    }
  }, []);

  // Load bookmark categories
  useEffect(() => {
    if (!categories.length) {
      getCategories();
    }
  }, []);

  useEffect(() => {
    if (localSearch) {
      // Search through apps
      setAppSearchResult([
        ...apps.filter(({ name, description, url }) =>
          new RegExp(escapeRegex(localSearch), 'i').test(
            `${name} ${description} ${url}`
          )
        ),
      ]);

      // Search through bookmarks

      const categoriesFiltered = categories.filter(({ name }) => {
        return regexSearch(localSearch, name)
      })

      const bookmarkFiltered = categories.map((category) => {
        const bm = { ...category }
        bm.bookmarks = category.bookmarks.filter((bookmark) => {
          return regexSearch(localSearch, `${bookmark.name} ${bookmark.description} ${bookmark.url}`)
        })

        return bm
      }).filter(({ bookmarks }) => bookmarks.length > 0)

      const namesInArr1 = new Set(categoriesFiltered.map(item => item.name));
      const uniqueItemsFromArr2 = bookmarkFiltered.filter(item => !namesInArr1.has(item.name));

      setBookmarkSearchResult([...categoriesFiltered, ...uniqueItemsFromArr2]);
    } else {
      setAppSearchResult(null);
      setBookmarkSearchResult(null);
    }
  }, [localSearch]);

  return (
    <Container>
      {!config.hideSearch ? (
        <SearchBar
          setLocalSearch={setLocalSearch}
          appSearchResult={appSearchResult}
          bookmarkSearchResult={bookmarkSearchResult}
        />
      ) : (
        <div></div>
      )}

      <Header />

      {!isAuthenticated &&
        !apps.some((a) => a.isPinned) &&
        !categories.some((c) => c.isPinned) ? (
        <Message>
          Welcome to Flame! Go to <Link to="/settings/app">/settings</Link>,
          login and start customizing your new homepage
        </Message>
      ) : (
        <></>
      )}

      {!config.hideApps && (isAuthenticated || apps.some((a) => a.isPinned)) ? (
        <Fragment>
          <SectionHeadline title="Applications" link="/applications" />
          {appsLoading ? (
            <Spinner />
          ) : (
            <AppGrid
              apps={
                !appSearchResult
                  ? apps.filter(({ isPinned }) => isPinned)
                  : appSearchResult
              }
              totalApps={apps.length}
              searching={!!localSearch}
            />
          )}
          <div className={classes.HomeSpace}></div>
        </Fragment>
      ) : (
        <></>
      )}

      {!config.hideCategories &&
        (isAuthenticated || categories.some((c) => c.isPinned)) ? (
        <Fragment>
          <SectionHeadline title="Bookmarks" link="/bookmarks" />
          {bookmarksLoading ? (
            <Spinner />
          ) : (
            <BookmarkGrid
              categories={
                !bookmarkSearchResult
                  ? categories.filter(
                    ({ isPinned, bookmarks }) => isPinned && bookmarks.length
                  )
                  : bookmarkSearchResult
              }
              totalCategories={categories.length}
              searching={!!localSearch}
              fromHomepage={true}
            />
          )}
        </Fragment>
      ) : (
        <></>
      )}

      <Link to="/settings" className={classes.SettingsButton}>
        <Icon icon="mdiCog" color="var(--color-background)" />
      </Link>
    </Container>
  );
};
