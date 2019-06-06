import React, { Component } from 'react';
import moment from 'moment';
import api from '../../services/api';
import logo from '../../assets/logo.png';
import { Container, Form } from './styles';
import CompareList from '../../components/CompareList';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: '',
    repositories: [],
  };

  async componentDidMount() {
    this.setState({ loading: true });
    this.setState({ loading: false, repositories: await this.getLocalRepositories() });
  }

  handleRemoveRepository = async (id) => {
    const list = [...this.state.repositories];
    const updatedList = list.filter(item => item.id !== id);
    this.setState({ repositories: updatedList });
    await localStorage.setItem('repositories', JSON.stringify(updatedList));
  };

  getLocalRepositories = async () => JSON.parse(await localStorage.getItem('repositories')) || [];

  onHandleRepository = async (e) => {
    e.preventDefault();
    try {
      this.setState({ loading: true });
      const { data: repository } = await api.get(`repos/${this.state.repositoryInput}`);
      repository.lastCommit = moment(repository.pushed_at).fromNow();
      this.setState({
        repositoryInput: '',
        repositories: [...this.state.repositories, repository],
        repositoryError: false,
      });
      localStorage.setItem('repositories', JSON.stringify(this.state.repositories));
    } catch (err) {
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="Github Compare" />
        <Form withError={this.state.repositoryError} onSubmit={this.onHandleRepository}>
          <input
            type="text"
            placeholder="usuário/repositório"
            value={this.state.repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">
            {this.state.loading ? <i className="fa fa-spinner fa-spin" /> : 'OK'}
          </button>
        </Form>
        <div>
          <CompareList
            repositories={this.state.repositories}
            removeRepository={this.handleRemoveRepository}
          />
        </div>
      </Container>
    );
  }
}
