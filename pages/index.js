import Head from 'next/head';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { prettyPrintJson } from 'pretty-print-json';

export default function Home() {
  const baseUrl = 'https://api.genshin.dev';
  const [state, setState] = useState({
    activePath: [],
    apiResponse: null,
  });

  function updateState(newState) {
    setState((prev) => {
      return {
        ...prev,
        ...newState,
      };
    });
  }

  async function fetchApi(targetUrl) {
    try {
      const resp = await axios.get(targetUrl);
      return resp.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async function makeCall(path = null) {
    let targetUrl = baseUrl;
    let activePath = [];
    if (path) {
      activePath = [...state.activePath, path];
      const newPath = activePath.join('/');
      targetUrl = [baseUrl, newPath].join('/');
    } // endif

    const resp = await fetchApi(targetUrl);
    if (!resp) {
      return false;
    } // endif

    updateState({
      activePath,
      apiResponse: path ? resp : resp?.types,
    });
  }

  async function goBack() {
    const currentPath = state.activePath;
    currentPath.pop();

    const isCurrentPathEmpty = currentPath.length < 1;
    const targetUrl = isCurrentPathEmpty
      ? baseUrl
      : [baseUrl, ...currentPath].join('/');
    const resp = await fetchApi(targetUrl);
    updateState({
      apiResponse: !isCurrentPathEmpty ? resp : resp?.types,
    });
  }

  useEffect(() => {
    makeCall();
  }, []);

  function clickLists(paths) {
    const listHtml = paths.map((path) => (
      <a
        className={styles.listItem}
        href="#"
        key={path}
        onClick={() => makeCall(path)}
      >
        {path}
      </a>
    ));

    return <div className={styles.listWrapper}>{listHtml}</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretty-print-json@1.4.0/dist/css/pretty-print-json.min.css"
        />
        <title>Genshin Api</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <h1>
            {state.activePath.length > 0 && (
              <a className={styles.listItem} href="#" onClick={goBack}>
                back
              </a>
            )}
            <span> Genshin Book </span>
          </h1>

          <div>
            {state.apiResponse?.length > 0 ? (
              clickLists(state.apiResponse)
            ) : (
              <div
                style={{ maxWidth: '600px' }}
                dangerouslySetInnerHTML={{
                  __html: prettyPrintJson.toHtml(state.apiResponse, {
                    indent: 3,
                    lineNumbers: true,
                  }),
                }}
              ></div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://next.new" target="_blank" rel="noopener noreferrer">
          Created by Albert with&nbsp;<b>next.new</b>&nbsp;⚡️
        </a>
      </footer>
    </div>
  );
}
