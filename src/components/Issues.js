import React, {useState, useEffect} from "react";
import {FlexCenter} from "../styles/Grid";
import {EmptyPlaceholder} from "../styles/EmptyPlaceholder";
import api from "../lib/apiGraphQL";
import Card from "./Card";
import List from "../styles/List";
import IssuesListItem from "../components/IssueListItem";
import {InputButton} from "../styles/Button";
import {CardPadding, CardHeader} from "../styles/Card";
import {IssueOpenedIcon} from "@primer/octicons-react";
import IssuesLoader from "./IssuesLoader";

function Issues({repoName, owner}) {
  const [issues, setIssues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotal] = useState(0);
  const [issuesEnabled, setIssuesEnabled] = useState(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.persistedRepositoryIssuesFetch(owner, repoName).then(response => {
      const {data, totalCount} = response.data.gitHub.repositoryOwner.repository.issues;
      const {hasIssuesEnabled} = response.data.gitHub.repositoryOwner.repository;
      const lastIssue = totalCount > 0 ? data[data.length - 1] : {};
      const {cursor} = lastIssue;

      setIssues(data);
      setIssuesEnabled(hasIssuesEnabled);
      setCursor(cursor);
      setTotal(totalCount);
      setLoading(false);
    });
  }, []);

  const _handleNextIssues = () => {
    setIssuesLoading(true);
    api.persistedRepositoryIssuesFetch(owner, repoName, cursor).then(response => {
      const {data, totalCount} = response.data.gitHub.repositoryOwner.repository.issues;
      const firstIssue = data[data.length - 1];
      const newCursor = firstIssue.cursor;
      setIssues(data);
      setCursor(newCursor);
      setTotal(totalCount);
      setOffset(offset + 5);
      setIssuesLoading(false);
    });
  };

  const _handlePreviousIssues = () => {
    setIssuesLoading(true);
    api.persistedRepositoryIssuesFetch(owner, repoName, cursor, true).then(response => {
      console.log(response);
      const {data, totalCount} = response.data.gitHub.repositoryOwner.repository.issues;
      const newCursor = data[0].newCursor;
      setIssues(data);
      setCursor(newCursor);
      setTotal(totalCount);
      setOffset(offset - 5);
      setIssuesLoading(false);
    });
  };

  const totalPages = Math.round(totalCount / 5);
  const currentPage = offset / 5 + 1;

  return owner ? (
    <Card fitted>
      <CardHeader>
        <h1>Issues</h1>
      </CardHeader>
      {totalCount > 0 ? (
        <List>
          {issuesLoading ? (
            <IssuesLoader />
          ) : (
            issues &&
            issues.map(issue => (
              <li key={issue.node.id}>
                <a rel="noreferrer" target="_blank" href={issue.node.url}>
                  <IssuesListItem
                    type="issues"
                    title={issue.node.title}
                    labels={issue.node.labels}
                    author={issue.node.author.login}
                    opened={issue.node.createdAt}
                    participants={issue.node.participants}
                    comments={issue.node.comments}
                    milestone={issue.node.milestone}
                  />
                </a>
              </li>
            ))
          )}
          <CardPadding>
            <FlexCenter className="pagination-buttons">
              {offset > 0 && <InputButton onClick={_handlePreviousIssues}>Prev</InputButton>}
              {currentPage !== totalPages && <InputButton onClick={_handleNextIssues}>Next</InputButton>}
            </FlexCenter>
          </CardPadding>
        </List>
      ) : loading ? (
        <IssuesLoader />
      ) : (
        <EmptyPlaceholder style={{marginTop: 100}}>
          {issuesEnabled ? (
            <div>
              <div style={{color: "grey"}}>
                <IssueOpenedIcon size="large" verticalAlign="middle" />
              </div>
              <div className="helper">No Issues found</div>
            </div>
          ) : (
            <div>
              <div style={{color: "grey"}}>
                <IssueOpenedIcon size="large" verticalAlign="middle" />
              </div>
              <div className="helper">Issues not enabled</div>
            </div>
          )}
        </EmptyPlaceholder>
      )}
    </Card>
  ) : (
    <p>...Loading</p>
  );
}

export default Issues;
