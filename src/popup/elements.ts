import styled from 'styled-components'
import { List } from 'antd'


export const Wrapper = styled.div`
  width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const TimelineContainer = styled.div`
  width: 200px;
`


export const ListItem = styled(List.Item)`
  display: flex;
  justify-content: space-between;
`