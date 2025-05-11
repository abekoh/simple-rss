package resolver

import (
	"context"
	"fmt"
	"net/http"
	urlpkg "net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func detectFeedURLs(ctx context.Context, url string) ([]string, error) {
	parsedURL, err := urlpkg.Parse(url)
	if err != nil {
		return nil, fmt.Errorf("failed to parse url: %w", err)
	}
	(&http.Request{
		Method: "GET",
		URL:    parsedURL,
	}).WithContext(ctx)
	res, err := http.DefaultClient.Do(&http.Request{
		Method: "GET",
		URL:    parsedURL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch top page: %w", err)
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch top page: status code is not 200: %s", res.Status)
	}
	defer res.Body.Close()

	parsedHTML, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		// HTMLでなければそのまま返却
		return []string{url}, nil
	}

	urlSet := make(map[string]struct{})
	urlSet[url] = struct{}{}
	for _, selector := range []string{
		"link[rel=alternate][type='application/atom+xml']",
		"link[rel=alternate][type='application/rss+xml']",
		"link[rel=alternate][type='application/feed+json']",
	} {
		for _, sel := range parsedHTML.Find(selector).EachIter() {
			href, ok := sel.Attr("href")
			if !ok {
				continue
			}
			if strings.HasPrefix(href, "https://") || strings.HasPrefix(href, "http://") {
				urlSet[href] = struct{}{}
			} else if strings.HasPrefix(href, "/") {
				urlSet[fmt.Sprintf("%s://%s%s", parsedURL.Scheme, parsedURL.Host, href)] = struct{}{}
			}
		}
	}
	urls := make([]string, 0, len(urlSet))
	for url := range urlSet {
		urls = append(urls, url)
	}
	if len(urls) == 0 {
		return nil, fmt.Errorf("failed to find feed url")
	}
	return urls, nil
}
