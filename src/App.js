import React, { Component } from 'react';
import styled from 'styled-components'
import csv from 'csvtojson'
import {validate as isEmail} from 'email-validator'
import saveCsv from 'save-csv'

import {Textarea, Box, Button, Alert, Label, Select, Row, Col, FormGroup} from 'smooth-ui'

const Container = styled.div`
  padding: 1rem;
  min-height: 100vh;
  background: #f2f2f2;
`

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const fixName = (fullName) => {
  const arr = fullName.split(" ")
  const [fname, ...rest] = arr
  return {
    fname,
    lname: rest.join(' ')
  }
}
const fixNameFromEmail = (email) => {
  const str = email.split("@")
  const arr = str[0].split(".")
  const [fname, ...rest] = arr
  return {
    fname: capitalizeFirstLetter(fname),
    lname: rest.map(str => capitalizeFirstLetter(str)).join(' ')
  }
}


const storage = global.localStorage
const DATA_KEY = 'DATA_KEY_V2'
const COLUMNS = [
  'name',
  'email',
  'school'
]

const COLUMNS_OUT = [
  'fname',
  'lname',
  'email',
  'school'
]

const initalState = {
  text: '',
  data: null,
  error: null,
  mapping: []
}

class App extends Component {
  constructor(props) {
    super(props)
    const preState = storage.getItem(DATA_KEY) ? JSON.parse(storage.getItem(DATA_KEY)) : null
    this.state = {
      ...initalState,
      ...preState
    }
  }
  saveState = (state) => {
    storage.setItem(DATA_KEY, JSON.stringify(this.state))
  }
  setText = (event) => {
    const text = event.target.value
    csv({
      noheader: false,
      output: "csv",
      delimiter: 'auto'
    }).fromString(text)
    .then((data)=>{
      this.setState({text, data, error: null}, this.saveState)
    })
    .catch((error) => {
      this.setState({text, error: error.message})
    })
  }
  onReset = () => {
    this.setState({
      ...initalState
    })
  }
  onSave = () => {
    saveCsv(this.getData(), {
      filename: `eksport-les-brukere-${new Date().getTime()}.csv`
    })
  }
  render() {
    const {text, data, error} = this.state
    return (
      <Container>
        <Box padding='5px' justifyContent='space-between'>
          {error && <Alert variant='primary'>{error}</Alert>}
          {data && <Button variant="primary" onClick={this.onSave}>Save csv</Button>}
          {data && <Button variant="primary" onClick={this.onReset}>Start over</Button>}
          {!data && <Label>Add csv-text</Label>}
        </Box>
        {!data && (
          <Box padding='5px'>
            <Textarea
              control
              value={text}
              onChange={this.setText}
            />
          </Box>
        )}
        {data && this.renderTableChooser()}
      </Container>
    );
  }
  renderTableChooser () {
    const {data, mapping} = this.state
    const firstColumn = data[0]
    const columnOptions = firstColumn && firstColumn.map((str, i) => ({
      label: `${str.length ? str : `Column ${i + 1}`}`,
      value: `${i}`,
      key: i
    }))
    const showTable = mapping.length === COLUMNS.length
    return (
      <div>
        <Box justifyContent='space-between'>
          <Row>
            {COLUMNS.map((column, i) => {
              const value = mapping.find(({key}) => key === column)
              const options = columnOptions.map((opt) => ({
                ...opt,
                selected: value && `${value.value}` === opt.value
              }))
              return (
                <Col xs={4} key={i}>
                  <FormGroup>
                    <Label>{column} column</Label><br />
                    <Select
                      control
                      options={options}
                      value={value ? value.value : ''}
                      onChange={(event) => {
                        const newValue = event.target.value
                        this.setState({
                          mapping: [
                            ...this.state.mapping.filter(({key}) => key !== column),
                            {
                              key: column,
                              value: parseInt(newValue, 12)
                            }
                          ]
                        }, this.saveState)
                      }}
                    />
                  </FormGroup>
                </Col>
              )
            })}
          </Row>
        </Box>
        {showTable && this.renderDataTable()}
      </div>
    )
  }
  getData () {
    const {data, mapping} = this.state
    const nameColumn = mapping.find(({key}) => key === 'name')
    const emailColumn = mapping.find(({key}) => key === 'email')
    const schoolColumn = mapping.find(({key}) => key === 'school')
    return data.reduce((items, item) => {
      const email = item[emailColumn.value]
      const school = item[schoolColumn.value]
      const person = {
        ...fixName(item[nameColumn.value]),
        email,
        school
      }
      const extraEmails = item.filter((str) => isEmail(str)).filter((str) => str !== email)
      const newItems = [
        person
      ]
      const extra = extraEmails.map((str) => ({
        ...fixNameFromEmail(str),
        email: str,
        school
      }))
      return [
        ...items,
        ...newItems,
        ...extra
      ]
    }, [])
  }
  renderDataTable () {
    return (
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            {COLUMNS_OUT.map((col, i) => <Th key={i}>{col}</Th>)}
          </tr>
        </thead>
        <tbody>
          {this.getData().map(({fname, lname, email, school}, i) => (
            <tr key={i}>
              <Td>{i + 1}</Td>
              <Td>{fname}</Td>
              <Td>{lname}</Td>
              <Td>{email}</Td>
              <Td>{school}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    )
  }
}

const Table = styled.table`
  border-collapse: collapse;
  margin: 0 0 2rem;
`
const Td = styled.td`
  padding: .5rem 1rem;
  border: 1px solid #ccc;
`
const Th = styled.th`
  padding: .5rem 1rem;
  border: 1px solid #ccc;
  font-weight: bold;
  background: #eee;
  text-align: left;
`

export default App;
