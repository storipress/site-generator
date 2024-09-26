# Notice: main branch has article loading issues

# Generator compatible layer

https://storipress-media.atlassian.net/browse/SPMVP-4328
這個專案的目標是做為舊的 builder 與新的 framework 中間的相容層，讓舊的 generator 可以產生以新的 framework 為基底的網站

這個專案包含
1. 新舊資料的格式轉換
2. 如何填入舊的資料等架構設計

目前的目錄：
- `playground`： 預計之後要由 generator 產出的檔案，與一些基本的設定檔
- 其它部份： 相容層的 code

## Development

1. 產生 publication 必要的檔案，使用 `yarn select <client id or alias>`
2. `yarn dev`
