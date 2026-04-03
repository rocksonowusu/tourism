import React, { useState } from 'react'
import Sites from './Sites'
import Media from './Media'
import { usePageTitle } from '../hooks/usePageTitle'
import s from './SitesAndMedia.module.css'

const IconMapPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconImage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

export default function SitesAndMedia() {
  const [activeTab, setActiveTab] = useState('sites')
  usePageTitle(activeTab === 'sites' ? 'Tourist Sites' : 'Media Library')

  return (
    <div className={s.wrapper}>
      <div className={s.tabBar}>
        <button
          className={`${s.tab} ${activeTab === 'sites' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('sites')}
        >
          <IconMapPin />
          Sites
        </button>
        <button
          className={`${s.tab} ${activeTab === 'media' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <IconImage />
          Media Library
        </button>
      </div>
      <div className={s.content}>
        {activeTab === 'sites' ? <Sites /> : <Media />}
      </div>
    </div>
  )
}
