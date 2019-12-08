#!/usr/bin/env /usr/local/bin/node

/**
 * Based on https://blog.jim-nielsen.com/2019/how-to-create-a-macos-menu-bar-app-for-netlify/
 */

require("dotenv").config({ path: __dirname + "/../.env" });
const https = require("https");
const url = require("url");
const querystring = require("querystring");

const API_TOKEN = process.env.NETLIFY_TOKEN;

// All my images as base64 strings
const imgLogo =
  "iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAWJQAAFiUBSVIk8AAABBdpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPHhtcE1NOkRlcml2ZWRGcm9tIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHN0UmVmOmluc3RhbmNlSUQ+eG1wLmlpZDpFQzNGNDNDODdCMkIxMUU5QkNENURBRDc2M0QxRTREQjwvc3RSZWY6aW5zdGFuY2VJRD4KICAgICAgICAgICAgPHN0UmVmOmRvY3VtZW50SUQ+eG1wLmRpZDpFQzNGNDNDOTdCMkIxMUU5QkNENURBRDc2M0QxRTREQjwvc3RSZWY6ZG9jdW1lbnRJRD4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDpFQzNGNDNDQjdCMkIxMUU5QkNENURBRDc2M0QxRTREQjwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDpFQzNGNDNDQTdC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";
const imgClear =
  "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMTgwMTE3NDA3MjA2ODExOTEwOUU5NTJDN0NFM0NDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3NUUxNjZCOTgzQjQxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3NUUxNjZCODgzQjQxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBBODAxMTc0MDcyMDY4MTE5MTA5RjVGN0Q0RUY3RTBGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAxODAxMTc0MDcyMDY4MTE5MTA5RTk1MkM3Q0UzQ0M2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wpZTbQAAAX9JREFUeNpMUT1PAkEQHe4WkIODysQYIJHigkBBaywor7OExPAPrC38If4CiYmt2tDQ2VFQYLQ6c3gm5igIJHd8HjhvdQ2bTPZj3ps38za22+0Iq9vtGo7jXPGxxVGm3/XO8VAqlW5t2w7xEGNCrNPpnIRh+JhMJqvxeJw0TZPo7XZL6/Walsvlq2EYF+12+0MMBgNzs9k8ZbPZSj6fp2KxSJlMRhKCICDXdcnzvOpisXju9/tneqPRuGZ2yzRNKhQKsup8PpcRRRGl02lidagejsfjQHALTa5OaMX3feK2SNd1qQDCarWiVCpFQgiaTqdNkUgkTlEFfavelRFYKIQCjINqWYCpqqrYHxoqKjgXgeDwwVKy+y4BxIZIp3ho5EaC2+lxn1Yul5OyCDWDAqPAbDaDAT2tXq/fsQufsBAK+wE17MgBA6zGLNeyrJvJZOKxbfik/4FxxhtywACLnz7g3DEnK8Ph8JKdOOf70R/nm2d7qdVq92zMG9+/fgQYADvJwKke/9+EAAAAAElFTkSuQmCC";
const imgGreen =
  "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMTgwMTE3NDA3MjA2ODExOTEwOUU5NTJDN0NFM0NDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRDQ4QkY5MzgzQjIxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRDQ4QkY5MjgzQjIxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBBODAxMTc0MDcyMDY4MTE5MTA5RjVGN0Q0RUY3RTBGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAxODAxMTc0MDcyMDY4MTE5MTA5RTk1MkM3Q0UzQ0M2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+K8S7HgAAAglJREFUeNo8Uc1rE0EcfbMz291uPjaJSWpTKtRoqA2oeBH1JrkVPHgwUG+CeujJg2L/A/Ggp1JBwYMo1INg1ZNSQVHwEkEtaqApmpjWlny0yW72I7Pr7B6cYfg9fvPevMdviO/7CNbdNze11dqz+QHplV1iTwc92Vd+jPqx5bMHzy9eK90ygx4RAjK/PDtVNSsrltotctmFL3nhI8STQF0ZqpVYK2gnzi2WX22w518extaHn1+4emfmWO4kZicvYVI7LNgETWMdK/X7+Nb8VFwfVF4+rSydoqzUuL6r1cuI2yjl5mB7BjatWnj6vIOxyAF8td4KV57ZbDUMZrCdCywuYsgEr9sPsG9kAqqkhZEsz0TLaUJWCQh1YXQF11F6R2jUA5UYPMlGhzTAIIeCIXHBR2wojIErQziD3jRj4k5SGVQagSbFEaEJKP8dDJh8F6a3B4uLITHKWZJmajaGBV3RkWQ5JOl4KPLFNnkX7WETHS7U5lA4pX6zQ+rx1Z/OViER1zEmjyMr5xGj6dBhj29DlgRwTZhOGwFXunr0zqOYka27fQM6SwiXNFIsK2omxDrT4fT7iApOwJXS2sSvy/mlBd6WGtXtd+iIcXreAL5nhbj69z28Fm1cyd9bCLjBT6vCNNe32zOP127MbQw+njGwsz+IFEFma2r09IeLxdtPokrqu2j9+SfAADck4Ixv4D2EAAAAAElFTkSuQmCC";
const imgRed =
  "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMTgwMTE3NDA3MjA2ODExOTEwOUU5NTJDN0NFM0NDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRDNFQjE5RDgzQjIxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRDNFQjE5QzgzQjIxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBBODAxMTc0MDcyMDY4MTE5MTA5RjVGN0Q0RUY3RTBGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAxODAxMTc0MDcyMDY4MTE5MTA5RTk1MkM3Q0UzQ0M2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+kBEPWQAAAfNJREFUeNo0kstrU0EUxr+ZOzPJTZo0SZumasGquLAmbXSTkgqK4ELtH6DiwpUP6J9TUBeCCzVLN8WNiG4Uumnzal1ZK00bm2oCzeO+7zj3Fgc+GM75fd/hMEOklAjOjUJepD37adpz7uu+mw9qBmXNnsYrPU28+NJo2kGNBIZb8/kz55zhWsEeFM87I2T8sIcuFdjhMTTEWPUnjy9/rDf3yc35gpjzRutLznGxvFBA9t4j8NmLKgpwfu3g6N0rfKs18JUna9tarMSmqf+k5JnFshxhsnQNpN2CqxSOV8ouXUe5ug4PYqFLo4/ZLCMPLrsu4pEI7PdvQaZOg+ix0CBNA7JzEPbm4GJbsewUp1dzLkCZrggJ2e0AjJ8YXAfwPdCojpwKVewVpnMOLnWVqhRPgCSSIAoIDcYIctAHhn1ww0SEc4eZXGwYWmJRJBOg2RzoxFRoCqb5g2PIo0P4fzQYGMCiosl+U1HpsOhiKplShmnQmbMg4+mTpXt/4VEK4tjomC4OpajQPY+83CKxWtvxVfI4SCoDmpkETU+EdzKWRNv2sUVj9YClrz99tjZo9O7mwKzu1msw9/cgLRPStmActLBbb2BzaNUUcydgyf+vsbJ8W1zQ8GzGsx4mfPdSUOtT9r2lRd788Mjz1bUP4fP/E2AAx5bQ4aoF5hYAAAAASUVORK5CYII=";
const imgYellow =
  "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMTgwMTE3NDA3MjA2ODExOTEwOUU5NTJDN0NFM0NDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRDQyMzY0RTgzQjIxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRDQyMzY0RDgzQjIxMUU5QjVENEQ3QzhFQjBCRDMyRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBBODAxMTc0MDcyMDY4MTE5MTA5RjVGN0Q0RUY3RTBGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAxODAxMTc0MDcyMDY4MTE5MTA5RTk1MkM3Q0UzQ0M2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+7SjG7QAAAgpJREFUeNokkU1oE0EYht+Zne0mm3SzJtmQphJiC6Vp1RaF+lNB/AcPnqSleuxRPIiU0pvXHtSD1FtPiiJ48uBJC2JF8CD1UFoEE9KsIbFJ2jTs5m9/nN0MDHy83/vM984McV0X3nqx+kje2nz/IEDNeVHojHtaz5Z22478bvrS3bWHy89NTyMcII8Xr56wDn59GE0Yk+mYBVV2/EMOTYq9GsOff6FtdmzqztP1jbxw9mRK0bfefp7JNCevzJ7H6VtPkLm4hPSZRWSylzEcqEBo5RKVauNmoyO9FtLBwtK0Vpk/l+4hcWoBtGfAOcr5m3QOEFLTUBtfYDuO9nO7YLCYWJ+b0GxEJAJ7Zx2OPAwiyn4kt2fCNUt+Lxu3UWzW51g8YGSTig2RMhC7Axg6QEUfIE4P4BrlvaRigXvHWZjTQZGBiSFgQAEZUAHWnwDLgNttAN0jBBwTssRsBlnLdYXKmBSKgIRSIMEhDqpeIG489CO5pvfENogc3WOITW3UrE9jkQgHBodAwqOAFOtPaO/DlTgqmqjVD0G4l167/+xV3tSK1bYJqqgcioGGExzU+rUSwX7bQN7Qip6XRrXjhZHrayu7ZaqX9K/odvNwaYtfvO3XJX0Tv8uCPnLj5Yrn9X46wIenzGZ94sfH5Xus9X1WotWkl6jjxMtW8MK3mdurb+TB6A6X/v4XYABO7c//Tbpc4wAAAABJRU5ErkJggg==";

// First fetch all my sites
fetchNetlify("sites")
  // Then fetch the build info for each of my sites and append the latest build
  // info into what netlify returns
  .then(sites => {
    return Promise.all(
      sites.map(site =>
        fetchNetlify(`sites/${site.site_id}/builds`, { per_page: 1 }).then(
          builds => ({
            ...site,
            ...(builds && builds[0] && builds[0].id
              ? { __latestBuild__: builds[0] }
              : {})
          })
        )
      )
    );
  })
  /*
    [
      {
        // `/sites` endpoint data from netlify
        id: String,
        site_id: String,
        admin_url: <String> links to netlify admin page
        url: <String> ,
        updated_at: <String> ISO8601 format

        // `/sites/:id/builds` data from netlify (the latest object)
        __latestBuild__: {
          "id": "5ceff7f99c0ff20174f10387",
          "deploy_id": "5ceff7f99c0ff20174f10386",
          "sha": null,
          "done": false,
          "error": null,
          "created_at": "2019-05-30T15:34:17.629Z"
        }
      }
    ]
  */
  .then(sites => {
    // Ok now we have the data how we want, let's loop over it and concatenate
    // a big string for bitbar
    let log = "";
    const addToLog = str => (log = log + str + "\n");
    let notifications = 0;

    sites.forEach(site => {
      const hostname = new URL(site.url).hostname;

      let img = imgClear;
      if (site.__latestBuild__) {
        const { done, error } = site.__latestBuild__;
        if (error) {
          notifications += 1;
          img = imgRed;
        } else if (done) {
          img = imgGreen;
        } else {
          notifications += 1;
          img = imgYellow;
        }
      }
      addToLog(`${hostname} | href=${site.admin_url} image=${img}`);
    });

    // Log it all out
    logNetlifyLogo(notifications);
    console.log(log);
  })
  .catch(e => {
    logNetlifyLogo();
    console.log("Whoops, caught an error.");
    console.log(e);
  });

/**
 * Outputs just the netlify logo in the menubar
 */
function logNetlifyLogo(notifications = 0) {
  console.log(
    `${notifications > 0 ? notifications : ""}|templateImage=${imgLogo}`
  );
  console.log("---");
}

/**
 * Take a path to a Netlify API endpoint and return a promise which resolves
 * to the data of that endpoint.
 * @param {String} endpoint
 */
function fetchNetlify(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    let uri = `https://api.netlify.com/api/v1/${endpoint}`;
    const query = querystring.stringify(params);
    if (query) {
      uri += `?${query}`;
    }

    const options = {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    };

    https
      .get(uri, options, res => {
        let data = "";
        // A chunk of data has been recieved.
        res.on("data", chunk => {
          data += chunk;
        });
        // The whole response has been received. Resolve it.
        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", err => {
        reject("Error: " + err.message);
      });
  });
}
