import { Get, Post, Patch, Put, Delete } from '../../../src/decorators/methods';
import { Route } from '../../../src/decorators/route';
import { Response, SuccessResponse } from '../../../src/decorators/response';
import { Controller } from '../../../src/interfaces/controller';
import { Tags } from '../../../src/decorators/tags';
import { Security } from '../../../src/decorators/security';
import { ModelService } from '../services/modelService';
import { TestModel, ErrorResponseModel } from '../testModel';

@Route('MethodTest')
export class MethodController extends Controller {

    @Get('Get')
    public async getMethod(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @Post('Post')
    public async postMethod(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @Patch('Patch')
    public async patchMethod(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @Put('Put')
    public async putMethod(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @Delete('Delete')
    public async deleteMethod(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    /**
     * method description
     */
    @Get('Description')
    public async description(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @Tags('Tag1', 'Tag2', 'Tag3')
    @Get('Tags')
    public async tags(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @Response<ErrorResponseModel>('400', 'Bad Request')
    @Response<ErrorResponseModel>('401', 'Unauthorized')
    @Response<ErrorResponseModel>('default', 'Unexpected error')
    @Get('MultiResponse')
    public async multiResponse(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @SuccessResponse('201', 'Created')
    @Get('SuccessResponse')
    public async successResponse(): Promise<void> {
        this.setStatus(201);
        return Promise.resolve();
    }

    @Security('api_key')
    @Get('ApiSecurity')
    public async apiSecurity(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    @Security('tsoa_auth', ['write:pets', 'read:pets'])
    @Get('OauthSecurity')
    public async oauthSecurity(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    /**
     * @deprecated
     */
    @Get('DeprecatedMethod')
    public async deprecatedMethod(): Promise<TestModel> {
        return new ModelService().getModel();
    }

    /**
     * @summary simple summary
     */
    @Get('SummaryMethod')
    public async summaryMethod(): Promise<TestModel> {
        return new ModelService().getModel();
    }
}
