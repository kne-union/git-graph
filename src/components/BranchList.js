import React from 'react';
import { BranchesOutlined, StarOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import styles from '../style.module.scss';

const BranchListInner = ({ localBranches = [], remoteBranches = [], selectedBranch, onBranchClick }) => {
  const { formatMessage } = useIntl();

  const renderBranchItem = branch => {
    const isActive = selectedBranch?.name === branch.name;
    const isCurrent = branch.isCurrent;
    const isMerged = branch.isMerged;

    return (
      <div key={branch.name} className={`${styles.branchItem} ${isActive ? styles.branchItemActive : ''} ${isMerged ? styles.branchItemMerged : ''}`} onClick={() => onBranchClick(branch)}>
        <BranchesOutlined />
        <span>{branch.name}</span>
        {isCurrent && <StarOutlined className={styles.currentBadge} />}
        {isMerged && <span className={styles.mergedBadge}>{formatMessage({ id: 'merged' })}</span>}
      </div>
    );
  };

  return (
    <div className={styles.branchList}>
      <div className={styles.branchListHeader}>{formatMessage({ id: 'branchTitle' })}</div>
      <div className={styles.branchListContent}>
        {localBranches.length > 0 && (
          <div className={styles.branchSection}>
            <div className={styles.branchSectionTitle}>{formatMessage({ id: 'localBranch' })}</div>
            {localBranches.map(renderBranchItem)}
          </div>
        )}

        {remoteBranches.length > 0 && (
          <div className={styles.branchSection}>
            <div className={styles.branchSectionTitle}>{formatMessage({ id: 'remoteBranch' })}</div>
            {remoteBranches.map(branch =>
              renderBranchItem({
                ...branch,
                name: branch.name.replace('remotes/origin/', '')
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BranchList = withLocale(BranchListInner);

export default BranchList;
