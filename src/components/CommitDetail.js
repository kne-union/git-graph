import React from 'react';
import { Empty } from 'antd';
import { FileOutlined, PlusCircleOutlined, WarningOutlined, DeleteOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import dayjs from 'dayjs';
import styles from '../style.module.scss';

const CommitDetailInner = ({ commit }) => {
  const { formatMessage } = useIntl();

  const formatDate = dateString => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM D, YYYY, HH:mm A');
  };

  const changedFiles = commit?.changedFiles || [
    { name: 'src/components/Dashboard.js', status: 'added' },
    { name: 'src/styles/main.css', status: 'modified' },
    { name: 'src/utils/api.js', status: 'deleted' }
  ];

  const getFileIcon = status => {
    switch (status) {
      case 'added':
        return <PlusCircleOutlined className={styles.iconAdded} />;
      case 'modified':
        return <WarningOutlined className={styles.iconModified} />;
      case 'deleted':
        return <DeleteOutlined className={styles.iconDeleted} />;
      default:
        return <FileOutlined />;
    }
  };

  if (!commit) {
    return (
      <div className={styles.commitDetail}>
        <div className={styles.changedFiles}>
          <div className={styles.changedFilesContent}>
            <h2 className={styles.sectionTitle}>{formatMessage({ id: 'changedFiles' })}</h2>
            <div className={styles.emptyState}>{formatMessage({ id: 'selectCommit' })}</div>
          </div>
        </div>
        <div className={styles.commitInfo}>
          <h2 className={styles.sectionTitle}>{formatMessage({ id: 'commitDetails' })}</h2>
          <Empty description={formatMessage({ id: 'noCommitSelected' })} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.commitDetail}>
      <div className={styles.changedFiles}>
        <div className={styles.changedFilesContent}>
          <h2 className={styles.sectionTitle}>{formatMessage({ id: 'changedFiles' })}</h2>
          <div className={styles.fileListHeader}>{formatMessage({ id: 'name' })}</div>
          <ul className={styles.fileList}>
            {changedFiles.map((file, index) => (
              <li key={index} className={styles.fileItem}>
                <FileOutlined />
                <span className={styles.fileName}>{file.name}</span>
                <div className={styles.fileActions}>{getFileIcon(file.status)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.commitInfo}>
        <h2 className={styles.sectionTitle}>{formatMessage({ id: 'commitDetails' })}</h2>
        <div>
          <p className={styles.commitSubject}>{commit.subject}.</p>
          {commit.body && <p className={styles.commitBody}>{commit.body}</p>}
        </div>
        <div className={styles.commitMeta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{formatMessage({ id: 'sha' })}</span>
            <span className={styles.metaValue}>{commit.commit?.short}...</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{formatMessage({ id: 'author' })}:</span>
            <span className={styles.metaValue}>
              {commit.author?.name} &lt;{commit.author?.email}&gt;
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{formatMessage({ id: 'date' })}:</span>
            <span className={styles.metaValue}>{formatDate(commit.author?.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommitDetail = withLocale(CommitDetailInner);

export default CommitDetail;
