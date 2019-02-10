import { distanceInWords } from 'date-fns';
import { MenuItemConstructorOptions, shell } from 'electron'; // tslint:disable-line no-implicit-dependencies
import { IAppDeploys, IAppSettings } from './menubar';
import { INetlifySite } from './netlify';

interface IDeployMenuOptions {
  currentSite: INetlifySite;
  deploys: IAppDeploys;
  onItemClick: (deployId: string) => void;
}

export const getDeploysMenu = ({
  currentSite,
  deploys,
  onItemClick
}: IDeployMenuOptions): MenuItemConstructorOptions[] => {
  const { pending: pendingDeploys, ready: doneDeploys } = deploys;
  const mapDeployToMenuItem = ({
    context,
    created_at,
    state,
    branch,
    deploy_time,
    id
  }) => {
    return {
      click: () => onItemClick(id),
      label: `${context}: ${state} → ${branch} | ${distanceInWords(
        new Date(created_at),
        new Date()
      )} ago ${deploy_time ? `in ${deploy_time}s` : ''}`
    };
  };

  return [
    {
      click: () => shell.openExternal(`${currentSite.admin_url}/deploys`),
      label: 'Overview'
    },
    {
      enabled: false,
      label: '—'
    },
    ...pendingDeploys.map(mapDeployToMenuItem),
    ...(pendingDeploys.length ? [{ label: '—', enabled: false }] : []),
    ...doneDeploys.map(mapDeployToMenuItem)
  ].slice(0, 20);
};

interface ISiteMenuOptions {
  sites: INetlifySite[];
  currentSite: INetlifySite;
  onItemClick: (siteId: string) => void;
}

export const getSitesMenu = ({
  sites,
  currentSite,
  onItemClick
}: ISiteMenuOptions): MenuItemConstructorOptions[] => {
  return sites.map(
    ({ id, url }): MenuItemConstructorOptions => ({
      checked: currentSite.id === id,
      click: () => onItemClick(id),
      label: `${url.replace(/https?:\/\//, '')}`,
      type: 'radio'
    })
  );
};

interface ICheckboxMenuOptions {
  items: Array<{ key: string; label: string }>;
  settings: IAppSettings;
  onItemClick: (key: string, value: boolean) => void;
}

export const getCheckboxMenu = ({
  items,
  settings,
  onItemClick
}: ICheckboxMenuOptions): MenuItemConstructorOptions[] => {
  return items.map(
    ({ label, key }): MenuItemConstructorOptions => ({
      checked: settings[key],
      click: () => onItemClick(key, settings[key]),
      label,
      type: 'checkbox'
    })
  );
};
