import { DateTimeResolver, DateResolver } from 'graphql-scalars'
import { asNexusMethod } from 'nexus'
import { GraphQLUpload } from 'graphql-upload-ts'

export const DateTime = asNexusMethod(DateTimeResolver, 'dateTime')
export const Date = asNexusMethod(DateResolver, 'date')
export const Upload = asNexusMethod(GraphQLUpload, 'upload')