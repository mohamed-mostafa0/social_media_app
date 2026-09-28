import type mongoose from "mongoose";
import type { CreateOptions, Model, MongooseUpdateQueryOptions, ProjectionType, QueryFilter, QueryOptions, UpdateQuery } from "mongoose";





export class BaseRepository<T> {

    constructor(private model: Model<T>) { }


    async findOneDocument(filters: QueryFilter<T>, projection?: ProjectionType<T>, options?: QueryOptions): Promise<T | null> {
        return await this.model.findOne(filters, projection, options)
    }

    async findDocumentById(id: mongoose.Types.ObjectId | string, projection?: ProjectionType<T>, options?: QueryOptions): Promise<T | null> {
        return await this.model.findById(id, projection, options)
    }

    async createDocument(doc: Partial<T>, options?: CreateOptions): Promise<T> {
        const [created] = await this.model.create([doc as any], options);
        return created as unknown as T;
    }

    async findByIdAndUpdateDocument(id: mongoose.Types.ObjectId | string, updatedObject: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, updatedObject, options)
    }

    async findOneupdateDocument(filters: QueryFilter<T>, updatedObject: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
        return await this.model.findOneAndUpdate(filters, updatedObject, options)
    }

    async findDocuments(filters?: QueryFilter<T>, projection?: ProjectionType<T>, options?: QueryOptions): Promise<T[] | []> {
        return await this.model.find(filters, projection, options)
    }

    async findDocumentByIdAndDelete(id: mongoose.Types.ObjectId | string, options?: QueryOptions): Promise<T | null> {
        return await this.model.findByIdAndDelete(id, options)
    }

    async deleteManyDocuments(filter:QueryFilter<T>){
        return this.model.deleteMany(filter)
    }

}