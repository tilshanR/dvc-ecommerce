import { useEffect, useState } from "react";
import { getShopCategories } from "../services/categoryApi";

let cache = null;
let inflight = null;

export default function useCategories() {
  const [state, setState] = useState({
    categories: cache ?? [],
    isLoading: !cache,
    isError: false,
  });

  useEffect(() => {
    if (cache) return;
    let active = true;

    inflight ??= getShopCategories()
      .then((data) => (cache = data))
      .finally(() => {
        inflight = null;
      });

    inflight
      .then(
        (categories) =>
          active && setState({ categories, isLoading: false, isError: false }),
      )
      .catch(
        () =>
          active && setState({ categories: [], isLoading: false, isError: true }),
      );

    return () => {
      active = false;
    };
  }, []);

  return state;
}