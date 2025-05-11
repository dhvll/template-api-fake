import { renderToString } from "react-dom/server"
import type { Middleware } from "winterspec/middleware"
import type { ReactNode } from "react"
import { createElement } from "react"

export const withReact: Middleware<
  {},
  { react: (component: ReactNode) => Response }
> = async (req, ctx, next) => {
  ctx.react = (component: ReactNode) => {
    const pathComponents = new URL(req.url).pathname.split("/").filter(Boolean)
    const timezone = req.headers.get("X-Timezone") || "UTC"
    return new Response(
      renderToString(
        createElement(
          "html",
          { lang: "en" },
          createElement(
            "head",
            null,
            createElement("script", { src: "https://cdn.tailwindcss.com" }),
            createElement("style", {
              type: "text/tailwindcss",
              dangerouslySetInnerHTML: {
                __html: `
.btn {
  @apply text-white visited:text-white m-1 bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded
}
a {
   @apply underline text-blue-600 hover:text-blue-800 visited:text-purple-800 m-1
}
h2 {
  @apply text-xl font-bold my-2
}
input, select {
  @apply border border-gray-300 rounded p-1 ml-0.5
}
form {
  @apply inline-flex flex-col gap-2 border border-gray-300 rounded p-2 m-2 text-xs
}
button {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
}
`,
              },
            })
          ),
          createElement(
            "body",
            null,
            createElement(
              "div",
              null,
              createElement(
                "div",
                {
                  className:
                    "border-b border-gray-300 py-1 flex justify-between items-center",
                },
                createElement(
                  "div",
                  null,
                  createElement(
                    "span",
                    { className: "px-1 pr-2" },
                    "admin panel"
                  ),
                  pathComponents.map((component, index) =>
                    createElement(
                      "span",
                      { key: index },
                      createElement(
                        "span",
                        { className: "px-0.5 text-gray-500" },
                        "/"
                      ),
                      createElement(
                        "a",
                        {
                          href: `/${pathComponents
                            .slice(0, index + 1)
                            .join("/")}`,
                        },
                        component
                      )
                    )
                  )
                ),
                createElement(
                  "div",
                  { className: "mr-2 flex items-center" },
                  createElement(
                    "div",
                    { className: "text-xs text-gray-500 mr-1" },
                    new Date().toLocaleString()
                  ),
                  createElement("div", {
                    dangerouslySetInnerHTML: {
                      __html: `
                  <select
                    id="timezone-select"
                    class="text-xs"
                    value="${timezone}"
                    onchange="document.cookie = 'timezone=' + this.value + ';path=/'; location.reload();"
                  >
                    <option ${
                      timezone === "UTC" ? "selected" : ""
                    } value="UTC">UTC</option>
                    <option ${
                      timezone === "America/Los_Angeles" ? "selected" : ""
                    } value="America/Los_Angeles">Pacific</option>
                    <option ${
                      timezone === "Asia/Kolkata" ? "selected" : ""
                    } value="Asia/Kolkata">IST</option>
                  </select>
                  `,
                    },
                  })
                )
              ),
              createElement(
                "div",
                { className: "flex flex-col text-xs p-1" },
                component
              )
            )
          )
        )
      ),
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    )
  }

  return await next(req, ctx)
}
